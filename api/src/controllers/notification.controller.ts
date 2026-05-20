import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import Notification from "../models/notification.model.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import type { NotificationType } from "../models/notification.model.js";

const PLANT_TYPES: NotificationType[] = [
  "PLANT_ADDED",
  "PLANT_APPROVED",
  "PLANT_UPDATED",
  "PLANT_DELETED",
  "PLANT_RECORD_ADDED",
  "PLANT_RECORD_DELETED",
];
const USER_NOTIFICATION_TYPES: NotificationType[] = ["PLANT_APPROVED"];
const TEAM_TYPES: NotificationType[] = [
  "TEAM_MEMBER_ADDED",
  "TEAM_MEMBER_UPDATED",
  "TEAM_MEMBER_REMOVED",
];
const SITE_TYPES: NotificationType[] = ["SITE_UPDATED"];
const ACCESS_TYPES: NotificationType[] = ["ACCESS_REQUEST_SUBMITTED"];

function parseFilter(
  q: unknown,
  role: "admin" | "user" | undefined,
): {
  unreadOnly?: boolean;
  types?: NotificationType[];
} {
  if (role === "user") {
    const f = typeof q === "string" ? q : "all";
    if (f === "unread")
      return { unreadOnly: true, types: USER_NOTIFICATION_TYPES };
    return { types: USER_NOTIFICATION_TYPES };
  }

  const f = typeof q === "string" ? q : "all";
  if (f === "unread") return { unreadOnly: true };
  if (f === "plants") return { types: PLANT_TYPES };
  if (f === "team") return { types: TEAM_TYPES };
  if (f === "sites") return { types: SITE_TYPES };
  if (f === "access") return { types: ACCESS_TYPES };
  return {};
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    if (!adminId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit), 10) || 20),
    );
    const skip = (page - 1) * limit;
    const { unreadOnly, types } = parseFilter(req.query.filter, role);

    const query: Record<string, unknown> = {
      recipientAdminId: new Types.ObjectId(adminId),
    };
    if (unreadOnly) query.isRead = false;
    if (types?.length) query.type = { $in: types };

    const [items, totalCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);

    return res.status(StatusCodes.OK).json({
      notifications: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        limit,
      },
    });
  } catch (err) {
    console.error("[getNotifications]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    if (!adminId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const countQuery: Record<string, unknown> = {
      recipientAdminId: new Types.ObjectId(adminId),
      isRead: false,
    };
    if (role === "user") {
      countQuery.type = { $in: USER_NOTIFICATION_TYPES };
    }

    const count = await Notification.countDocuments(countQuery);
    return res.status(StatusCodes.OK).json({ count });
  } catch (err) {
    console.error("[getUnreadCount]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    const { id } = req.params;
    if (!adminId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (!id || !Types.ObjectId.isValid(id))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid notification id" });

    const typeScope =
      role === "user" ? { type: { $in: USER_NOTIFICATION_TYPES } } : {};

    const updated = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipientAdminId: new Types.ObjectId(adminId),
        ...typeScope,
      },
      { isRead: true },
      { new: true },
    ).lean();

    if (!updated)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Notification not found" });

    return res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    console.error("[markNotificationRead]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    if (!adminId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const filter: Record<string, unknown> = {
      recipientAdminId: new Types.ObjectId(adminId),
      isRead: false,
    };
    if (role === "user") {
      filter.type = { $in: USER_NOTIFICATION_TYPES };
    }

    const result = await Notification.updateMany(filter, { isRead: true });

    return res.status(StatusCodes.OK).json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("[markAllNotificationsRead]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    const { id } = req.params;
    if (!adminId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (!id || !Types.ObjectId.isValid(id))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid notification id" });

    const typeScope =
      role === "user" ? { type: { $in: USER_NOTIFICATION_TYPES } } : {};

    const del = await Notification.deleteOne({
      _id: id,
      recipientAdminId: new Types.ObjectId(adminId),
      ...typeScope,
    });

    if (del.deletedCount === 0)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Notification not found" });

    return res.status(StatusCodes.OK).json({ ok: true });
  } catch (err) {
    console.error("[deleteNotification]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const deleteAllNotifications = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    if (!adminId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const filter: Record<string, unknown> = {
      recipientAdminId: new Types.ObjectId(adminId),
    };
    if (role === "user") {
      filter.type = { $in: USER_NOTIFICATION_TYPES };
    }

    const result = await Notification.deleteMany(filter);

    return res.status(StatusCodes.OK).json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error("[deleteAllNotifications]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
