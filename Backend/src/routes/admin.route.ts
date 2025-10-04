import { Router, type NextFunction, type Response } from "express";
import {
  addTeam,
  getTeam,
  siteDashboard,
} from "../controllers/admin.controller.js";
import {
  authMiddleware,
  type AuthRequest,
} from "../middleware/auth.middleware.js";
import { StatusCodes } from "http-status-codes";
import { adminOnly } from "../middleware/role.middleware.js";
const adminRoute = Router();
adminRoute.use(authMiddleware, adminOnly);

adminRoute.get("/site/dashboard", siteDashboard);
adminRoute.get("/site/team", getTeam);
adminRoute.post("/site/team/add", addTeam);

export default adminRoute;
