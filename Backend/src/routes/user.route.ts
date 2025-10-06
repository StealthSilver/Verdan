import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getUserDashboard,
  getUserProfile,
  getSiteDashboard,
  getTreeDetails,
  addTree,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", getUserDashboard);
router.get("/profile", getUserProfile);
router.get("/site/dashboard", getSiteDashboard);
router.get("/site/dashboard/:treeId", getTreeDetails);
router.post("/site/dashboard/add", addTree);

export default router;
