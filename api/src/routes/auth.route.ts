import { Router } from "express";
import {
  signup,
  signin,
  getMe,
  sendSignupRequest,
  updateMyAvatar,
  refresh,
  logout,
} from "../controllers/auth.controller";
import { requireAdmin, authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Debug: enumerate auth routes
router.get("/_debug/routes", (req, res) => {
  try {
    const stack = (router as any).stack || [];
    const routes = stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => {
        const methods = Object.keys(layer.route.methods)
          .filter((m) => layer.route.methods[m])
          .map((m) => m.toUpperCase());
        return { path: layer.route.path, methods };
      });
    res.json({ count: routes.length, routes });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Failed to enumerate routes", error: String(e) });
  }
});

router.post("/signup", requireAdmin, signup);
router.post("/signin", signin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.patch("/me/avatar", authMiddleware, updateMyAvatar);
router.post("/signup-request", sendSignupRequest);
// Simple health check for deployment/debugging
router.get("/signup-request/health", (req, res) => {
  res.json({ ok: true, route: "/auth/signup-request" });
});

export default router;
