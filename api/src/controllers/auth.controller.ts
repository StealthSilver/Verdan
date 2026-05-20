import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User, { type IUser } from "../models/user.model";
import { Types } from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  isSmtpConfigured,
  resolveSignupNotifyTo,
  sendEmail,
} from "../utils/email.util";
import {
  adminAccessRequestPlainText,
  buildAdminAccessRequestHtml,
  buildRequesterAccessConfirmationHtml,
  requesterAccessConfirmationPlainText,
} from "../utils/accessRequestEmail.templates";
import { notifyMasterAdminsAccessRequest } from "../utils/notificationHelper";
import { validateTeamMemberPassword } from "../utils/team-member-password.util";
import {
  buildAccessRequestApproveUrl,
  resolveAccessRequestApproveSiteId,
} from "../utils/access-request-approve.util";

const signupSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  siteId: z.string().min(1),
  gender: z.enum(["male", "female", "other"]).optional(),
  designation: z.string().min(1),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "12h";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid data" });

    const { name, email, password, siteId, gender, designation } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      siteId: new Types.ObjectId(siteId),
      gender: gender || "other",
      designation,
    });

    const access = generateToken(
      user,
      process.env.JWT_ACCESS_SECRET!,
      ACCESS_EXPIRES_IN,
    );
    const refresh = generateToken(
      user,
      process.env.JWT_REFRESH_SECRET!,
      REFRESH_EXPIRES_IN,
    );

    res.cookie("refreshToken", refresh, cookieOptions());
    return res.status(StatusCodes.CREATED).json({
      access,
      user: filterUser(user),
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid data" });

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });

    const access = generateToken(
      user,
      process.env.JWT_ACCESS_SECRET!,
      ACCESS_EXPIRES_IN,
    );
    const refresh = generateToken(
      user,
      process.env.JWT_REFRESH_SECRET!,
      REFRESH_EXPIRES_IN,
    );

    res.cookie("refreshToken", refresh, cookieOptions());
    return res.status(StatusCodes.OK).json({
      access,
      user: filterUser(user),
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message:
          "User account not found. Your account may have been removed due to site deletion or administrative action. Please contact your administrator.",
        code: "USER_NOT_FOUND",
      });
    }

    return res.status(StatusCodes.OK).json(user);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const updateMyAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Not authorized" });
    }

    const schema = z.object({
      avatarId: z.number().int().min(0).max(9),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid data" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { avatarId: parsed.data.avatarId },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    return res.status(StatusCodes.OK).json({ avatarId: updated.avatarId });
  } catch (err) {
    console.error(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Public endpoint: "Request access" notifies admins and sends a HARIT-branded confirmation to the requester (SMTP).
export const sendSignupRequest = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      company: z.string().optional(),
      password: z.string(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.flatten();
      console.warn("[SignupRequest] Validation failed", details);
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid data",
        errors: details,
      });
    }

    const { name, email, company, password } = parsed.data;

    const pwdCheck = validateTeamMemberPassword(password);
    if (!pwdCheck.ok) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: pwdCheck.message ?? "Password does not meet requirements",
      });
    }

    await notifyMasterAdminsAccessRequest({
      requesterName: name,
      requesterEmail: email,
      company: company || "",
    });

    const approveSiteId = await resolveAccessRequestApproveSiteId();
    const approveUrl =
      approveSiteId != null
        ? buildAccessRequestApproveUrl({
            siteId: approveSiteId,
            name,
            email,
            password,
          })
        : null;

    const payload = {
      name,
      email,
      company: company || "",
      approveUrl,
    };
    const adminHtml = buildAdminAccessRequestHtml(payload);
    const adminSubject = "HARIT – New admin access request";
    const adminText = adminAccessRequestPlainText(payload);

    const requesterHtml = buildRequesterAccessConfirmationHtml({ name });
    const requesterSubject = "HARIT – We received your access request";
    const requesterText = requesterAccessConfirmationPlainText({ name });

    if (!isSmtpConfigured()) {
      console.error(
        "[SignupRequest] SMTP not configured: set SMTP_HOST, SMTP_USER, SMTP_PASS (optional SMTP_PORT, SMTP_FROM_EMAIL)",
      );
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        message:
          "Email is not configured on the server. The administrator must set SMTP_HOST, SMTP_USER, and SMTP_PASS.",
      });
    }

    const to = resolveSignupNotifyTo();
    if (!to) {
      console.error(
        "[SignupRequest] No notify address: set SIGNUP_NOTIFY_TO, or use an email-shaped SMTP_FROM_EMAIL / SMTP_USER",
      );
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        message:
          "Signup notify address is not configured. Set SIGNUP_NOTIFY_TO to the admin inbox, or ensure SMTP_FROM_EMAIL or SMTP_USER is a full email address.",
      });
    }

    await sendEmail(to, adminSubject, adminHtml, adminText, {
      fromName: "HARIT",
    });

    try {
      await sendEmail(email, requesterSubject, requesterHtml, requesterText, {
        fromName: "HARIT",
      });
    } catch (ackErr) {
      console.error(
        "[SignupRequest] Admin notified but requester confirmation failed:",
        ackErr,
      );
    }

    return res.status(StatusCodes.OK).json({ message: "Request sent" });
  } catch (err) {
    console.error(err);
    const msg = (err as { message?: string })?.message || "Failed to send email";
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to send email", error: msg });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = (req as Request & { cookies?: any }).cookies?.refreshToken;
    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Missing refresh token" });
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as {
      sub: string;
      role?: string;
    };

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message:
          "User account not found. Your account may have been removed due to site deletion or administrative action. Please contact your administrator.",
        code: "USER_NOT_FOUND",
      });
    }

    const access = generateToken(user, process.env.JWT_ACCESS_SECRET, ACCESS_EXPIRES_IN);
    const rotatedRefresh = generateToken(
      user,
      process.env.JWT_REFRESH_SECRET,
      REFRESH_EXPIRES_IN,
    );
    res.cookie("refreshToken", rotatedRefresh, cookieOptions());

    return res.status(StatusCodes.OK).json({ access });
  } catch (err) {
    console.error("[auth.refresh] Failed:", err);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", cookieClearOptions());
  return res.status(StatusCodes.OK).json({ ok: true });
};

const generateToken = (
  user: IUser,
  secret: string,
  expiresIn: string | number
) => {
  const userId =
    user._id instanceof Types.ObjectId
      ? user._id.toHexString()
      : String(user._id);

  const payload = { sub: userId, role: user.role };

  //@ts-ignore
  return jwt.sign(payload, secret as jwt.Secret, { expiresIn });
};

const cookieClearOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
});

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: parseCookieMaxAgeMs(process.env.JWT_REFRESH_COOKIE_MAX_AGE_MS) ??
    30 * 24 * 60 * 60 * 1000,
});

const filterUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarId: user.avatarId,
  siteId: user.siteId,
  gender: user.gender,
  designation: user.designation,
});

function parseCookieMaxAgeMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}
