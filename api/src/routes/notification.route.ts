import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/unread-count", getUnreadCount);
router.patch("/mark-all-read", markAllNotificationsRead);
router.delete("/", deleteAllNotifications);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);
router.delete("/:id", deleteNotification);

export default router;
