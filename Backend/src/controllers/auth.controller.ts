import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User, { type IUser } from "../models/user.model";
import { Types } from "mongoose";

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

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as IUser;
    if (!user)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Not authorized" });

    return res.status(StatusCodes.OK).json(user);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
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
