import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User, { type IUser } from "../models/user.model";
import { Types } from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendResendEmail } from "../utils/resend.util";

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

    const access = generateToken(user, process.env.JWT_ACCESS_SECRET!, "15m");
    const refresh = generateToken(user, process.env.JWT_REFRESH_SECRET!, "7d");

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

    const access = generateToken(user, process.env.JWT_ACCESS_SECRET!, "15m");
    const refresh = generateToken(user, process.env.JWT_REFRESH_SECRET!, "7d");

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

// Public endpoint to collect signup interest and email admins via Resend
export const sendSignupRequest = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      company: z.string().optional(),
      message: z.string().min(5),
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

    const { name, email, company, message } = parsed.data;

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; background:#0b1220; color:#e6f1ff; padding:24px">
        <h2 style="margin:0 0 16px; color:#7ee787">New Signup Request</h2>
        <p style="margin:0 0 12px">A user requested admin access. Details below:</p>
        <div style="background:#121a2a; border:1px solid #22304a; border-radius:12px; padding:16px">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || "-"}</p>
          <p style="white-space:pre-wrap"><strong>Message:</strong><br/>${message}</p>
        </div>
        <p style="margin-top:16px; font-size:12px; color:#94a3b8">Sent via VERDAN signup form</p>
      </div>
    `;

    const result = await sendResendEmail({
      to: process.env.SIGNUP_NOTIFY_TO || "rajat.saraswat.0409@gmail.com",
      subject: "VERDAN – New Signup Request",
      html,
      text: `New signup request\nName: ${name}\nEmail: ${email}\nCompany: ${
        company || "-"
      }\nMessage: ${message}`,
    });

    return res
      .status(StatusCodes.OK)
      .json({ message: "Request sent", id: (result as any)?.data?.id });
  } catch (err) {
    console.error(err);
    const msg = (err as any)?.message || "Failed to send email";
    // If Resend returns testing restriction, surface as 400 for clarity
    if (msg.includes("You can only send testing emails")) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: msg,
        hint: "For Resend testing, set SIGNUP_NOTIFY_TO to your Resend account email or verify a domain and set RESEND_FROM to use that domain.",
      });
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to send email", error: msg });
  }
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

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const filterUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  siteId: user.siteId,
  gender: user.gender,
  designation: user.designation,
});
