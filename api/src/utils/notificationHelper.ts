import { Types } from "mongoose";
import Site from "../models/site.model.js";
import User from "../models/user.model.js";
import Notification, {
  type NotificationType,
} from "../models/notification.model.js";
import { getSignupNotifyEmails } from "./email.util.js";

const TEAM_NOTIFICATION_TYPES: NotificationType[] = [
  "TEAM_MEMBER_ADDED",
  "TEAM_MEMBER_UPDATED",
  "TEAM_MEMBER_REMOVED",
];

/**
 * Master admins: users with role `admin` whose email appears in SIGNUP_NOTIFY_TO
 * (comma-separated). They must have portal accounts matching those emails.
 */
export async function resolveMasterAdminUserIds(): Promise<Types.ObjectId[]> {
  try {
    const emails = getSignupNotifyEmails();
    if (emails.length === 0) return [];

    const admins = await User.find({ role: "admin" })
      .select("email _id")
      .lean();
    const emailSet = new Set(emails);
    const ids: Types.ObjectId[] = [];
    for (const u of admins) {
      const em =
        u.email && typeof u.email === "string"
          ? u.email.trim().toLowerCase()
          : "";
      if (em && emailSet.has(em) && u._id) {
        ids.push(u._id as Types.ObjectId);
      }
    }
    return ids;
  } catch (err) {
    console.error("[resolveMasterAdminUserIds]", err);
    return [];
  }
}

/**
 * Whether this admin is a recipient for site-scoped team notifications (managedBy or all-admins fallback).
 * Team events never use "exclude actor" — the acting admin must still see adds on their sites.
 */
export async function adminWouldReceiveSiteTeamNotification(
  adminId: string,
  siteId: string,
): Promise<boolean> {
  try {
    if (!Types.ObjectId.isValid(siteId) || !Types.ObjectId.isValid(adminId))
      return false;

    const site = await Site.findById(siteId).select("managedBy").lean();
    if (!site) return false;

    let recipientIds: Types.ObjectId[] = [];

    if (site.managedBy) {
      const mgrId = String(site.managedBy);
      const manager = await User.findById(mgrId).select("role").lean();
      if (manager && manager.role === "admin") {
        recipientIds.push(new Types.ObjectId(mgrId));
      }
    }

    if (recipientIds.length === 0) {
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      for (const a of admins) {
        if (a._id) recipientIds.push(a._id as Types.ObjectId);
      }
    }

    return recipientIds.some((r) => r.toString() === adminId);
  } catch (err) {
    console.error("[adminWouldReceiveSiteTeamNotification]", err);
    return false;
  }
}

/**
 * When a team member is added, master admins (SIGNUP_NOTIFY_TO) must see every add on any site.
 * Skip inserting a duplicate if that admin already received the same event via site-scoped routing.
 */
export async function notifyMasterAdminsTeamMemberIfNeeded(
  siteId: string,
  siteName: string,
  message: string,
  meta: Record<string, unknown>,
): Promise<void> {
  try {
    const masterIds = await resolveMasterAdminUserIds();
    if (masterIds.length === 0) return;

    const docs: {
      recipientAdminId: Types.ObjectId;
      type: NotificationType;
      message: string;
      siteId: Types.ObjectId;
      siteName: string;
      isRead: boolean;
      meta: Record<string, unknown>;
    }[] = [];

    for (const mid of masterIds) {
      const idStr = mid.toString();
      const already = await adminWouldReceiveSiteTeamNotification(
        idStr,
        siteId,
      );
      if (already) continue;

      docs.push({
        recipientAdminId: mid,
        type: "TEAM_MEMBER_ADDED",
        message: `[All sites] ${message}`,
        siteId: new Types.ObjectId(siteId),
        siteName,
        isRead: false,
        meta: { ...meta, masterBroadcast: true },
      });
    }

    if (docs.length === 0) return;
    await Notification.insertMany(docs);
  } catch (err) {
    console.error("[notifyMasterAdminsTeamMemberIfNeeded]", err);
  }
}

export async function notifyMasterAdminsAccessRequest(meta: {
  requesterName: string;
  requesterEmail: string;
  company?: string;
}): Promise<void> {
  try {
    const ids = await resolveMasterAdminUserIds();
    if (ids.length === 0) return;

    const co = meta.company?.trim();
    const tail = co ? ` · ${co}` : "";
    const msg = `Access request: ${meta.requesterName} (${meta.requesterEmail})${tail}`;

    const docs = ids.map((recipientAdminId) => ({
      recipientAdminId,
      type: "ACCESS_REQUEST_SUBMITTED" as NotificationType,
      message: msg,
      siteName: "Access request",
      isRead: false,
      meta: {
        requesterName: meta.requesterName,
        requesterEmail: meta.requesterEmail,
        company: meta.company ?? "",
      },
    }));

    await Notification.insertMany(docs);
  } catch (err) {
    console.error("[notifyMasterAdminsAccessRequest]", err);
  }
}

/**
 * Resolves managing admin(s) via Site.managedBy and creates notification docs.
 * Fire-and-forget safe: never throws; logs errors only.
 */
export async function createNotification(
  type: NotificationType,
  siteId: string | Types.ObjectId | undefined,
  message: string,
  meta: Record<string, unknown> = {},
  excludeActorAdminIds: string[] = [],
): Promise<void> {
  try {
    if (siteId === undefined || siteId === null) return;
    const sid = String(siteId);
    if (!Types.ObjectId.isValid(sid)) return;

    const site = await Site.findById(sid).select("name managedBy").lean();
    if (!site) return;

    const siteName =
      typeof site.name === "string" && site.name.length > 0
        ? site.name
        : "site";

    const recipientIds: Types.ObjectId[] = [];
    /** When true, many admins receive the same event — exclude actor to avoid duplicate self-alerts. */
    let usedBroadcastFallback = false;

    if (site.managedBy) {
      const mgrId = String(site.managedBy);
      const manager = await User.findById(mgrId).select("role").lean();
      if (manager && manager.role === "admin") {
        recipientIds.push(new Types.ObjectId(mgrId));
      }
    }

    // Legacy sites often have no managedBy until an admin updates the site — notify all admins.
    if (recipientIds.length === 0) {
      usedBroadcastFallback = true;
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      for (const a of admins) {
        if (a._id) recipientIds.push(a._id as Types.ObjectId);
      }
    }

    const exclude = new Set(excludeActorAdminIds.filter(Boolean));
    // Site managers always see activity on their sites (including actions they took themselves).
    // For team events, never strip the acting admin on broadcast fallback — they must see their own adds.
    const excludeOnBroadcast =
      usedBroadcastFallback && !TEAM_NOTIFICATION_TYPES.includes(type);
    const filteredRecipients = excludeOnBroadcast
      ? recipientIds.filter((rid) => !exclude.has(rid.toString()))
      : recipientIds;

    const docs = filteredRecipients.map((recipientAdminId) => ({
      recipientAdminId,
      type,
      message,
      siteId: new Types.ObjectId(sid),
      siteName,
      isRead: false,
      meta,
    }));

    if (docs.length === 0) return;
    await Notification.insertMany(docs);
  } catch (err) {
    console.error("[createNotification]", err);
  }
}

/**
 * Notifies all portal users (role `user`) on the site's team when an admin approves a plant.
 */
export async function notifyTeamUsersPlantApproved(
  siteId: string,
  treeId: string,
  treeName: string,
): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(siteId) || !Types.ObjectId.isValid(treeId))
      return;

    const site = await Site.findById(siteId).select("name teamMembers").lean();
    if (!site) return;

    const siteName =
      typeof site.name === "string" && site.name.length > 0
        ? site.name
        : "site";

    const recipientIds = new Set<string>();
    for (const m of site.teamMembers || []) {
      recipientIds.add(String(m));
    }
    const byPrimarySite = await User.find({
      role: "user",
      siteId: new Types.ObjectId(siteId),
    })
      .select("_id")
      .lean();
    for (const u of byPrimarySite) {
      if (u._id) recipientIds.add(String(u._id));
    }
    if (recipientIds.size === 0) return;

    const members = await User.find({
      _id: {
        $in: [...recipientIds].map((id) => new Types.ObjectId(id)),
      },
      role: "user",
    })
      .select("_id")
      .lean();

    const label = treeName?.trim() || "A plant";
    const message = `${label} on ${siteName} was approved by an admin`;

    const docs = members
      .filter((m) => m._id)
      .map((m) => ({
        recipientAdminId: m._id as Types.ObjectId,
        type: "PLANT_APPROVED" as NotificationType,
        message,
        siteId: new Types.ObjectId(siteId),
        siteName,
        isRead: false,
        meta: { treeId } as Record<string, unknown>,
      }));

    if (docs.length === 0) return;
    await Notification.insertMany(docs);
  } catch (err) {
    console.error("[notifyTeamUsersPlantApproved]", err);
  }
}
