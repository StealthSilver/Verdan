import { type NextFunction, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import User, { type IUser } from "../models/user.model";
import type { Types } from "mongoose";

export interface AuthRequest extends Request {
  user?: { id: string; role: "admin" | "user" };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Missing Authorization header" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Malformed Authorization header" });
    }

    const token = parts[1];
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as {
      sub: string;
    };

    const user = (await User.findById(payload.sub)) as IUser | null;
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User not found" });
    }

    const userId = (user._id as Types.ObjectId).toString();
    req.user = { id: userId, role: user.role };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Admin access only" });
  }

  next();
}
