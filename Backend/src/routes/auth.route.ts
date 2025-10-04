import { Router } from "express";
import { signup, signin, getMe } from "../controllers/auth.controller";
import { requireAdmin, authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", requireAdmin, signup);
router.post("/signin", signin);
router.get("/me", authMiddleware, getMe);

export default router;
