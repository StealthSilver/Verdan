import mongoose, { Schema, Document, Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "PLANT_ADDED",
  "PLANT_APPROVED",
  "PLANT_UPDATED",
  "PLANT_DELETED",
  "PLANT_RECORD_ADDED",
  "PLANT_RECORD_DELETED",
  "TEAM_MEMBER_ADDED",
  "TEAM_MEMBER_UPDATED",
  "TEAM_MEMBER_REMOVED",
  "SITE_UPDATED",
  "ACCESS_REQUEST_SUBMITTED",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  recipientAdminId: Types.ObjectId;
  type: NotificationType;
  message: string;
  siteId?: Types.ObjectId;
  siteName?: string;
  isRead: boolean;
  meta: Record<string, unknown>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    message: { type: String, required: true },
    siteId: { type: Schema.Types.ObjectId, ref: "Site" },
    siteName: { type: String },
    isRead: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

notificationSchema.index({ recipientAdminId: 1, createdAt: -1 });
notificationSchema.index({ recipientAdminId: 1, isRead: 1 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
