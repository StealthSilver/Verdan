import { type NextFunction, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { AuthRequest } from "./auth.middleware";

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Forbidden: Admins only" });
  }
  next();
}
