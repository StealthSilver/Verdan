import { Types } from "mongoose";
import Site from "../models/site.model";
import { resolvePortalUrlForEmail } from "./team-welcome-email.util";

/**
 * Site used in "Approve Request" deep links from access-request emails.
 * Prefer ACCESS_REQUEST_APPROVE_SITE_ID; if unset and exactly one site exists, use that.
 */
export async function resolveAccessRequestApproveSiteId(): Promise<
  string | null
> {
  const envId = process.env.ACCESS_REQUEST_APPROVE_SITE_ID?.trim();
  if (envId && Types.ObjectId.isValid(envId)) {
    const exists = await Site.exists({ _id: envId });
    if (exists) return envId;
  }
  const count = await Site.countDocuments();
  if (count === 1) {
    const only = await Site.findOne().select("_id").lean();
    if (only?._id) return String(only._id);
  }
  return null;
}

export function buildAccessRequestApproveUrl(input: {
  siteId: string;
  name: string;
  email: string;
  password: string;
}): string {
  const base = resolvePortalUrlForEmail().replace(/\/$/, "");
  const path = `/admin/Dashboard/${input.siteId}/team`;
  const q = new URLSearchParams({
    openAddMember: "1",
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
  });
  const joined = `${base}${path}?${q.toString()}`;
  return joined.startsWith("http") ? joined : `https://${joined}`;
}
