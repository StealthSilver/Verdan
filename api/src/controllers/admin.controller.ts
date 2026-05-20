import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user.model.js";
import Site, { ISite } from "../models/site.model.js";
import Tree from "../models/tree.model.js";
import { isSmtpConfigured, sendEmail } from "../utils/email.util.js";
import {
  buildTeamWelcomeEmail,
  resolvePortalUrlForEmail,
  roleDisplayLabel,
} from "../utils/team-welcome-email.util.js";
import {
  buildTeamMemberUpdateEmail,
  type TeamMemberUpdateChange,
} from "../utils/team-member-update-email.util.js";
import { validateTeamMemberPassword } from "../utils/team-member-password.util.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  deleteManyStoredMediaRefs,
  deleteStoredMediaRef,
  normalizeImageInput,
  normalizeMediaInput,
  normalizeTreeImageItems,
  obsoleteS3RefsAfterImageReplace,
} from "../utils/media-upload.util.js";
import { deleteS3Object, tryGetS3KeyFromObjectUrl } from "../config/s3.config.js";
import {
  signSiteForClient,
  signSitesForClient,
  signTreeForClient,
  signTreesForClient,
} from "../utils/media-response.util.js";
import {
  createNotification,
  notifyMasterAdminsTeamMemberIfNeeded,
  notifyTeamUsersPlantApproved,
} from "../utils/notificationHelper.js";

export const getAllSites = async (req: Request, res: Response) => {
  try {
    const sites = await Site.find().populate("teamMembers", "-password");

    const serializedSites = await signSitesForClient(
      sites.map((s: any) => ({
        ...s.toObject(),
        _id: s._id.toString(),
      })),
    );

    res.status(StatusCodes.OK).json(serializedSites);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const addSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, image, coordinates, status, type } = req.body;

    let imageUrl: string | undefined;
    if (image && typeof image === "string") {
      const up = await normalizeMediaInput(image, "sites", {
        siteName: name,
      });
      imageUrl = up.url;
    }

    const site = await Site.create({
      name,
      address,
      image: imageUrl,
      coordinates,
      status,
      type,
      ...(req.user?.id
        ? { managedBy: new Types.ObjectId(req.user.id) }
        : {}),
    });

    res.status(StatusCodes.CREATED).json(await signSiteForClient(site));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const { name, address, image, coordinates, status, type } = req.body;

    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    const prev = await Site.findById(siteId).select("image name");
    if (!prev)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });

    let imageUrl = image;
    if (image !== undefined && typeof image === "string") {
      const oldKey =
        prev.image && typeof prev.image === "string"
          ? tryGetS3KeyFromObjectUrl(prev.image)
          : null;
      const siteNameForKey =
        typeof name === "string" && name.trim()
          ? name
          : (prev as ISite).name ?? "";
      const up = await normalizeMediaInput(image, `sites/${siteId}`, {
        siteName: siteNameForKey,
      });
      imageUrl = up.url;
      const newKey = up.s3Key ?? tryGetS3KeyFromObjectUrl(up.url);
      if (oldKey && oldKey !== newKey) {
        await deleteS3Object(oldKey);
      }
    }

    const backfillManagedBy =
      !prev.managedBy && req.user?.id
        ? { managedBy: new Types.ObjectId(req.user.id) }
        : {};

    const site = await Site.findByIdAndUpdate(
      siteId,
      {
        name,
        address,
        ...(image !== undefined ? { image: imageUrl } : {}),
        coordinates,
        status,
        type,
        ...backfillManagedBy,
      },
      { new: true, runValidators: true },
    );

    if (!site)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });

    try {
      await createNotification(
        "SITE_UPDATED",
        siteId,
        `Site '${site.name}' details were updated`,
        {},
        req.user?.id ? [req.user.id] : [],
      );
    } catch (_n) {
      /* notification failures ignored */
    }

    res.status(StatusCodes.OK).json(await signSiteForClient(site));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getTeamForSite = async (req: Request, res: Response) => {
  try {
    const siteId = req.query.siteId as string;
    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    const site = await Site.findById(siteId).populate(
      "teamMembers",
      "-password",
    );
    if (!site)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });

    res.status(StatusCodes.OK).json(site.teamMembers);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const addTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      siteId,
      siteIds,
      gender,
      designation,
      organization,
    } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      !role ||
      (!siteId && !siteIds) ||
      !designation
    )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });

    // Defense-in-depth: only admins can create additional admins.
    // (Admin routes are already protected, but this prevents privilege escalation
    // if the handler is ever reused elsewhere.)
    if (role === "admin" && req.user?.role !== "admin") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden: Only admins can create admins" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email already registered" });

    const plainPassword = String(password).trim();
    const pwdCheck = validateTeamMemberPassword(plainPassword);
    if (!pwdCheck.ok) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: pwdCheck.message ?? "Invalid password" });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name,
      email,
      role,
      siteId: siteId ? new Types.ObjectId(siteId) : undefined,
      password: hashedPassword,
      gender: gender || "other",
      designation,
      organization: organization || "",
    });
    // Assign user to one or multiple sites' teamMembers
    if (Array.isArray(siteIds) && siteIds.length > 0) {
      const validIds = siteIds.filter((id: string) =>
        Types.ObjectId.isValid(id),
      );
      if (validIds.length) {
        await Site.updateMany(
          {
            _id: { $in: validIds.map((id: string) => new Types.ObjectId(id)) },
          },
          { $addToSet: { teamMembers: user._id } },
        );
      }
    } else if (siteId) {
      await Site.findByIdAndUpdate(siteId, {
        $addToSet: { teamMembers: user._id },
      });
    }

    const assignedSiteIdStrings: string[] =
      Array.isArray(siteIds) && siteIds.length > 0
        ? siteIds.filter((id: string) => Types.ObjectId.isValid(id))
        : siteId && Types.ObjectId.isValid(siteId)
          ? [siteId]
          : [];

    let emailSent = false;
    if (isSmtpConfigured()) {
      try {
        const siteDocs =
          assignedSiteIdStrings.length > 0
            ? await Site.find({
                _id: {
                  $in: assignedSiteIdStrings.map(
                    (id) => new Types.ObjectId(id),
                  ),
                },
              })
                .select("name")
                .lean()
            : [];
        const siteNames = (siteDocs as { name?: string }[])
          .map((s) => (typeof s.name === "string" ? s.name : ""))
          .filter(Boolean);

        const { html, text } = buildTeamWelcomeEmail({
          recipientName: name,
          email,
          plainPassword,
          siteNames,
          roleLabel: roleDisplayLabel(role),
          designation,
          portalUrl: resolvePortalUrlForEmail(),
        });

        await sendEmail(
          email,
          "Welcome to Harit — your portal credentials",
          html,
          text,
          { fromName: "Harit Portal" },
        );
        emailSent = true;
      } catch (mailErr) {
        console.error("[addTeamMember] welcome email failed:", mailErr);
      }
    } else {
      console.warn(
        "[addTeamMember] SMTP not configured; skipping welcome email",
      );
    }

    if (assignedSiteIdStrings.length > 0) {
      const siteDocsForNotify = await Site.find({
        _id: {
          $in: assignedSiteIdStrings.map((id) => new Types.ObjectId(id)),
        },
      })
        .select("name")
        .lean();
      const notifyRows = siteDocsForNotify as unknown as Array<{
        _id: Types.ObjectId;
        name?: string;
      }>;
      const excludeActors = req.user?.id ? [req.user.id] : [];
      const midStr = String(user._id);
      for (const sid of assignedSiteIdStrings) {
        const doc = notifyRows.find((s) => String(s._id) === sid);
        const sn =
          doc && typeof doc.name === "string" && doc.name.length > 0
            ? doc.name
            : "site";
        const msg = `${name} (${midStr}) was added to ${sn}`;
        try {
          await createNotification(
            "TEAM_MEMBER_ADDED",
            sid,
            msg,
            { memberId: midStr, memberName: name },
            excludeActors,
          );
          await notifyMasterAdminsTeamMemberIfNeeded(sid, sn, msg, {
            memberId: midStr,
            memberName: name,
          });
        } catch (_n) {
          /* ignore */
        }
      }
    }

    res.status(StatusCodes.CREATED).json({
      message: "Team member created successfully",
      emailSent,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarId: user.avatarId,
        siteId: user.siteId,
        gender: user.gender,
        designation: user.designation,
        organization: user.organization,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

/** Single member for edit drawer: profile + all sites where they are a team member */
export const getTeamMemberForEdit = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.query.siteId as string;
    const memberId = req.query.memberId as string;
    if (!siteId || !memberId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId or memberId" });
    }
    if (!Types.ObjectId.isValid(siteId) || !Types.ObjectId.isValid(memberId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid siteId or memberId format" });
    }

    const site = await Site.findById(siteId).select("teamMembers").lean();
    if (!site) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });
    }
    const onSite = (site.teamMembers || []).some(
      (id) => String(id) === memberId,
    );
    if (!onSite) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Team member not found on this site",
      });
    }

    const user = await User.findById(memberId).select("-password").lean();
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const sitesWithMember = await Site.find({
      teamMembers: new Types.ObjectId(memberId),
    })
      .select("_id")
      .lean();
    const siteIds = sitesWithMember.map((s) => String(s._id));

    res.status(StatusCodes.OK).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender ?? "other",
      designation: user.designation,
      organization: user.organization ?? "",
      siteIds,
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const updateTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const {
      memberId,
      siteId: bodySiteId,
      name,
      email,
      password,
      role,
      gender,
      designation,
      organization,
      siteIds,
    } = req.body;

    if (!memberId || !bodySiteId || !name || !email || !role || !designation) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });
    }

    if (!Types.ObjectId.isValid(memberId) || !Types.ObjectId.isValid(bodySiteId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid memberId or siteId format" });
    }

    if (role === "admin" && req.user?.role !== "admin") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden: Only admins can assign admin role" });
    }

    const site = await Site.findById(bodySiteId).select("teamMembers").lean();
    if (!site) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });
    }
    const onSite = (site.teamMembers || []).some(
      (id) => String(id) === memberId,
    );
    if (!onSite) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Team member not found on this site",
      });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const finalSiteIds: string[] = Array.isArray(siteIds)
      ? siteIds.filter((id: string) => Types.ObjectId.isValid(id))
      : [];
    if (finalSiteIds.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Select at least one site" });
    }

    const emailTrimmed = String(email).trim();
    if (user.email.toLowerCase() !== emailTrimmed.toLowerCase()) {
      const taken = await User.findOne({
        email: emailTrimmed,
        _id: { $ne: user._id },
      });
      if (taken) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "Email already registered" });
      }
    }

    const plainPassword =
      typeof password === "string" && password.trim().length > 0
        ? password.trim()
        : "";
    if (plainPassword) {
      const pwdCheck = validateTeamMemberPassword(plainPassword);
      if (!pwdCheck.ok) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: pwdCheck.message ?? "Invalid password",
        });
      }
    }

    const changes: TeamMemberUpdateChange[] = [];

    if (user.name !== name) {
      changes.push({
        label: "Name",
        detail: `Changed from "${user.name}" to "${name}"`,
      });
    }
    if (user.email.toLowerCase() !== emailTrimmed.toLowerCase()) {
      changes.push({
        label: "Username (email)",
        detail: `Changed from "${user.email}" to "${emailTrimmed}"`,
      });
    }
    if (user.role !== role) {
      changes.push({
        label: "Role",
        detail: `Changed from "${roleDisplayLabel(user.role)}" to "${roleDisplayLabel(role)}"`,
      });
    }
    const prevGender = user.gender || "other";
    const nextGender = gender || "other";
    if (prevGender !== nextGender) {
      changes.push({
        label: "Gender",
        detail: `Changed from "${prevGender}" to "${nextGender}"`,
      });
    }
    if (user.designation !== designation) {
      changes.push({
        label: "Designation",
        detail: `Changed from "${user.designation}" to "${designation}"`,
      });
    }
    const prevOrg = user.organization || "";
    const nextOrg = organization || "";
    if (prevOrg !== nextOrg) {
      changes.push({
        label: "Organization",
        detail: `Changed from "${prevOrg || "—"}" to "${nextOrg || "—"}"`,
      });
    }

    const prevSiteSet = new Set(
      (
        await Site.find({ teamMembers: user._id })
          .select("_id")
          .lean()
      ).map((s) => String(s._id)),
    );
    const nextSiteSet = new Set(finalSiteIds);
    let sitesDifferent = prevSiteSet.size !== nextSiteSet.size;
    if (!sitesDifferent) {
      for (const id of finalSiteIds) {
        if (!prevSiteSet.has(id)) {
          sitesDifferent = true;
          break;
        }
      }
    }
    if (sitesDifferent) {
      const added = finalSiteIds.filter((id) => !prevSiteSet.has(id));
      const removed = [...prevSiteSet].filter((id) => !nextSiteSet.has(id));
      const siteDocs = await Site.find({
        _id: {
          $in: [...added, ...removed].map((id) => new Types.ObjectId(id)),
        },
      })
        .select("name")
        .lean();
      const nameById = new Map(
        siteDocs.map((s) => [String(s._id), (s as { name?: string }).name || ""]),
      );
      const parts: string[] = [];
      if (added.length)
        parts.push(
          `Added to: ${added.map((id) => nameById.get(id) || id).join(", ")}`,
        );
      if (removed.length)
        parts.push(
          `Removed from: ${removed.map((id) => nameById.get(id) || id).join(", ")}`,
        );
      changes.push({
        label: "Site assignments",
        detail: parts.join(". ") || "Updated",
      });
    }

    if (changes.length === 0 && !plainPassword) {
      return res.status(StatusCodes.OK).json({
        message: "No changes to apply",
        emailSent: false,
        noChanges: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarId: user.avatarId,
          siteId: user.siteId,
          gender: user.gender,
          designation: user.designation,
          organization: user.organization,
        },
      });
    }

    user.name = name;
    user.email = emailTrimmed;
    user.role = role;
    user.gender = nextGender;
    user.designation = designation;
    user.organization = nextOrg;
    if (plainPassword) {
      user.password = await bcrypt.hash(plainPassword, 10);
    }
    if (finalSiteIds.length > 0) {
      user.siteId = new Types.ObjectId(finalSiteIds[0]);
    }
    await user.save();

    const memberOid = user._id as Types.ObjectId;
    await Site.updateMany(
      { teamMembers: memberOid },
      { $pull: { teamMembers: memberOid } },
    );
    await Site.updateMany(
      {
        _id: {
          $in: finalSiteIds.map((id) => new Types.ObjectId(id)),
        },
      },
      { $addToSet: { teamMembers: memberOid } },
    );

    if (plainPassword) {
      changes.push({
        label: "Password",
        detail: "Your sign-in password was reset.",
      });
    }

    let emailSent = false;
    if ((changes.length > 0 || plainPassword) && isSmtpConfigured()) {
      try {
        const displayName = name;
        const { html, text } = buildTeamMemberUpdateEmail({
          recipientName: displayName,
          changes,
          portalUrl: resolvePortalUrlForEmail(),
          newPlainPassword: plainPassword || undefined,
        });
        await sendEmail(
          user.email,
          "Your Harit account was updated",
          html,
          text,
          { fromName: "Harit Portal" },
        );
        emailSent = true;
      } catch (mailErr) {
        console.error("[updateTeamMember] update email failed:", mailErr);
      }
    } else if (!isSmtpConfigured()) {
      console.warn(
        "[updateTeamMember] SMTP not configured; skipping update email",
      );
    }

    res.status(StatusCodes.OK).json({
      message: "Team member updated successfully",
      emailSent,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarId: user.avatarId,
        siteId: user.siteId,
        gender: user.gender,
        designation: user.designation,
        organization: user.organization,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Remove a team member from a site and delete the user record entirely
export const removeTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.query.siteId as string;
    const memberId = req.query.memberId as string;

    if (!siteId || !memberId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId or memberId" });
    }

    if (!Types.ObjectId.isValid(siteId) || !Types.ObjectId.isValid(memberId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid siteId or memberId format" });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });
    }

    // Ensure member exists
    const user = await User.findById(memberId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    // Pull member from site's teamMembers array
    await Site.updateOne(
      { _id: siteId },
      { $pull: { teamMembers: new Types.ObjectId(memberId) } },
    );

    try {
      const siteRow = await Site.findById(siteId).select("name").lean();
      const siteLabel =
        siteRow && typeof siteRow.name === "string" && siteRow.name.length > 0
          ? siteRow.name
          : "site";
      const memberName =
        typeof user.name === "string" && user.name.length > 0
          ? user.name
          : "Team member";
      await createNotification(
        "TEAM_MEMBER_REMOVED",
        siteId,
        `${memberName} was removed from ${siteLabel}`,
        { memberId },
        req.user?.id ? [req.user.id] : [],
      );
    } catch (_n) {
      /* ignore */
    }

    // Delete user record entirely (clears from user collection)
    await User.findByIdAndDelete(memberId);

    return res.status(StatusCodes.OK).json({
      message: "Team member deleted successfully",
      deletedMemberId: memberId,
      siteId,
    });
  } catch (err) {
    console.error("removeTeamMember error", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const deleteSite = async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;

    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    // Validate siteId format
    if (!Types.ObjectId.isValid(siteId))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid siteId format" });

    const site = await Site.findById(siteId);
    if (!site)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });

    // Find all users associated with this site (both via siteId and teamMembers)
    // We need to delete all non-admin users associated with this site
    try {
      const siteObjectId = new Types.ObjectId(siteId);

      // Find users who have this site assigned via siteId field OR are in teamMembers array
      const associatedUsers = await User.find({
        $and: [
          { role: { $ne: "admin" } }, // Exclude admin users
          {
            $or: [
              { siteId: siteObjectId },
              { siteId: siteId },
              { _id: { $in: site.teamMembers } },
            ],
          },
        ],
      });

      // Delete all non-admin users associated with this site
      if (associatedUsers.length > 0) {
        const userIds = associatedUsers.map((user) => user._id);
        const userDeleteResult = await User.deleteMany({
          _id: { $in: userIds },
        });
        void userDeleteResult;
      }

      // Also remove any remaining siteId references (for safety, though users will be deleted)
      await User.updateMany(
        {
          $or: [{ siteId: siteObjectId }, { siteId: siteId }],
        },
        { $unset: { siteId: "" } },
      );
    } catch (userErr: any) {
      console.error("Error processing users:", userErr);
      console.error("User processing error details:", userErr?.message);
      // Continue with deletion even if user processing fails
    }

    // Delete all trees associated with this site
    // Try both ObjectId and string formats
    try {
      const siteObjectId = new Types.ObjectId(siteId);
      const treesToClean = await Tree.find({
        $or: [{ siteId: siteObjectId }, { siteId: siteId }],
      })
        .select("images")
        .lean();
      for (const t of treesToClean) {
        await deleteManyStoredMediaRefs(
          (t.images || []) as { s3Key?: string }[],
        );
      }
      const treeDeleteResult = await Tree.deleteMany({
        $or: [{ siteId: siteObjectId }, { siteId: siteId }],
      });
      void treeDeleteResult;
    } catch (treeErr: any) {
      console.error("Error deleting trees:", treeErr);
      console.error("Tree delete error details:", treeErr?.message);
      // Continue with deletion even if tree deletion fails
    }

    if (site.image && typeof site.image === "string") {
      const coverKey = tryGetS3KeyFromObjectUrl(site.image);
      if (coverKey) await deleteS3Object(coverKey);
    }

    // Delete the site
    await Site.findByIdAndDelete(siteId);

    res.status(StatusCodes.OK).json({
      message: "Site deleted successfully",
      details:
        "All associated non-admin users, trees, and site data have been removed",
    });
  } catch (err: any) {
    console.error("Delete site error:", err);
    console.error("Error details:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    });

    const errorMessage = err?.message || "Server error";
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: errorMessage });
  }
};

export const verifyTree = async (req: Request, res: Response) => {
  try {
    const { treeId } = req.params;

    if (!treeId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing treeId" });

    const before = await Tree.findById(treeId).select(
      "verified siteId treeName",
    );
    if (!before) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    }

    const tree = await Tree.findByIdAndUpdate(
      treeId,
      { verified: true },
      { new: true },
    );

    if (!tree) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    }

    if (!before.verified && tree.siteId) {
      try {
        await notifyTeamUsersPlantApproved(
          String(tree.siteId),
          String(tree._id),
          typeof tree.treeName === "string" ? tree.treeName : "",
        );
      } catch (_n) {
        /* ignore */
      }
    }

    res.status(StatusCodes.OK).json(await signTreeForClient(tree));
  } catch (err) {
    console.error("Error verifying tree:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getSiteById = async (req: Request, res: Response) => {
  try {
    let { siteId } = req.params;
    // Clean and trim the siteId
    siteId = siteId?.trim();

    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    // First, get all sites to compare IDs
    const allSites = await Site.find({}, "_id name").lean();
    const allSiteIds = allSites.map((s: any) => s._id.toString());

    // Check if siteId matches any existing site (exact match first)
    let matchingSiteId = allSiteIds.find((id) => id === siteId);

    // If no exact match, try case-insensitive match
    if (!matchingSiteId) {
      matchingSiteId = allSiteIds.find(
        (id) => id.toLowerCase() === siteId.toLowerCase(),
      );
      if (matchingSiteId) {
        siteId = matchingSiteId; // Use the matched ID
      }
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(siteId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Invalid siteId format: ${siteId}`,
        receivedSiteId: siteId,
        availableSiteIds: allSiteIds,
        siteCount: allSites.length,
      });
    }

    // Try to find the site using the (possibly corrected) siteId
    let site = await Site.findById(siteId).populate("teamMembers", "-password");

    // If not found with findById, try with findOne using ObjectId
    if (!site) {
      try {
        const siteObjectId = new Types.ObjectId(siteId);
        site = await Site.findOne({ _id: siteObjectId }).populate(
          "teamMembers",
          "-password",
        );
      } catch (objIdErr) {
        console.error("Error creating ObjectId:", objIdErr);
      }
    }

    if (site) {
      return res.status(StatusCodes.OK).json(await signSiteForClient(site));
    }

    // Site not found - return detailed error
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `Site not found with ID: ${siteId}`,
      receivedSiteId: req.params.siteId,
      searchedSiteId: siteId,
      availableSiteIds: allSiteIds,
      siteCount: allSites.length,
      suggestion:
        allSiteIds.length > 0
          ? `Available sites: ${allSiteIds.slice(0, 5).join(", ")}${
              allSiteIds.length > 5 ? "..." : ""
            }`
          : "No sites found in database",
    });
  } catch (err) {
    console.error("Error in getSiteById:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getTreesBySite = async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(siteId))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid siteId format" });

    // Get total count for pagination
    const totalCount = await Tree.countDocuments({
      siteId: new Types.ObjectId(siteId),
    });

    const trees = await Tree.find({ siteId: new Types.ObjectId(siteId) })
      .select(
        "treeName treeType coordinates datePlanted timestamp status remarks verified plantedBy images",
      )
      .populate("plantedBy", "name email")
      .sort({ datePlanted: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(StatusCodes.OK).json({
      trees: await signTreesForClient(trees),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const resetDatabase = async (req: Request, res: Response) => {
  try {
    // Clear all collections
    await User.deleteMany({});
    await Site.deleteMany({});
    await Tree.deleteMany({});

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@verdan.com",
      password: hashedPassword,
      role: "admin",
      designation: "System Administrator",
      gender: "other",
    });

    res.status(StatusCodes.OK).json({
      message: "Database reset successfully",
      admin: {
        email: "admin@verdan.com",
        password: "admin123",
        id: admin._id,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const addTree = async (req: AuthRequest, res: Response) => {
  try {
    const {
      siteId,
      treeName,
      treeType,
      coordinates,
      datePlanted,
      timestamp,
      status,
      remarks,
      plantedBy,
      images,
    } = req.body;
    const userId = req.user?.id;

    if (!siteId || !treeName || !coordinates || !userId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });

    // Verify site exists
    const site = await Site.findById(siteId);
    if (!site)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });

    const mediaPrefix = `trees/${siteId}/new`;
    let treeImages: { url: string; timestamp: Date; s3Key?: string }[] = [];
    if (images && Array.isArray(images) && images.length) {
      treeImages = await normalizeTreeImageItems(images, mediaPrefix, {
        siteName: site.name,
        treeName,
      });
    }

    const tree = await Tree.create({
      siteId: new Types.ObjectId(siteId),
      plantedBy: new Types.ObjectId(userId),
      plantedByName: plantedBy,
      treeName,
      treeType,
      coordinates,
      datePlanted: datePlanted ? new Date(datePlanted) : new Date(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: status || "healthy",
      remarks,
      images: treeImages,
      verified: false,
    });

    const populatedTree = await Tree.findById(tree._id)
      .populate("plantedBy", "name email")
      .populate("siteId", "name");

    try {
      const siteLabel =
        (populatedTree?.siteId as { name?: string } | undefined)?.name ?? "site";
      await createNotification(
        "PLANT_ADDED",
        siteId,
        `New plant '${treeName}' added to ${siteLabel}`,
        { treeId: String(tree._id) },
        userId ? [userId] : [],
      );
    } catch (_n) {
      /* ignore */
    }

    res
      .status(StatusCodes.CREATED)
      .json(await signTreeForClient(populatedTree));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const updateTree = async (req: AuthRequest, res: Response) => {
  try {
    const { treeId } = req.params;
    const {
      treeName,
      treeType,
      coordinates,
      datePlanted,
      timestamp,
      status,
      remarks,
      plantedBy,
      images,
    } = req.body;

    if (!treeId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing treeId" });

    const existing = await Tree.findById(treeId);
    if (!existing)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    const updateData: any = {};
    if (treeName) updateData.treeName = treeName;
    if (treeType) updateData.treeType = treeType;
    if (coordinates) updateData.coordinates = coordinates;
    if (datePlanted) updateData.datePlanted = new Date(datePlanted);
    if (timestamp) updateData.timestamp = new Date(timestamp);
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (plantedBy !== undefined) updateData.plantedByName = plantedBy;
    if (images !== undefined && Array.isArray(images)) {
      const siteDoc = await Site.findById(existing.siteId).select("name").lean();
      const siteName = (siteDoc as { name?: string } | null)?.name ?? "";
      const treeNameForKey =
        typeof treeName === "string" && treeName.trim()
          ? treeName
          : existing.treeName;
      const newImages = await normalizeTreeImageItems(
        images,
        `trees/${String(existing.siteId)}/${treeId}`,
        { siteName, treeName: treeNameForKey },
      );
      const obsolete = obsoleteS3RefsAfterImageReplace(
        existing.images as { url: string; s3Key?: string }[],
        newImages,
      );
      await deleteManyStoredMediaRefs(obsolete);
      updateData.images = newImages;
    }

    const tree = await Tree.findByIdAndUpdate(treeId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("plantedBy", "name email")
      .populate("siteId", "name");

    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    try {
      const siteLabel =
        (tree.siteId as { name?: string } | undefined)?.name ?? "site";
      await createNotification(
        "PLANT_UPDATED",
        existing.siteId,
        `Plant '${tree.treeName}' was updated in ${siteLabel}`,
        { treeId },
        req.user?.id ? [req.user.id] : [],
      );
    } catch (_n) {
      /* ignore */
    }

    res.status(StatusCodes.OK).json(await signTreeForClient(tree));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getTreeById = async (req: AuthRequest, res: Response) => {
  try {
    const { treeId } = req.params;
    if (!treeId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing treeId" });

    const tree = await Tree.findById(treeId)
      .populate("plantedBy", "name email")
      .populate("siteId", "name address status");

    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    // Ensure the tree's status reflects the latest record
    const treeObj = tree.toObject();
    if (treeObj.images && treeObj.images.length > 0) {
      // Sort images by timestamp to find the latest one
      const sortedImages = [...treeObj.images].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      // If we have a status field in the latest image record, we'd use it here
      // For now, we rely on the tree's current status being updated when records are added
    }

    res.status(StatusCodes.OK).json(await signTreeForClient(tree));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const addTreeRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { treeId } = req.params;
    const { image, coordinates, timestamp, status, remarks } = req.body;

    if (!treeId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing treeId" });

    if (!image)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Image is required" });

    const tree = await Tree.findById(treeId);
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    const siteDoc = await Site.findById(tree.siteId).select("name").lean();
    const uploaded = await normalizeImageInput(
      String(image),
      `trees/${String(tree.siteId)}/${treeId}/records`,
      {
        siteName: (siteDoc as { name?: string } | null)?.name ?? "",
        treeName: tree.treeName,
      },
    );
    const newImage = {
      url: uploaded.url,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      ...(uploaded.s3Key ? { s3Key: uploaded.s3Key } : {}),
    };

    // Build update object with $push for images and regular updates for other fields
    const updateData: any = {
      $push: { images: newImage },
    };

    // Optionally update other fields if provided (these work alongside $push)
    if (coordinates) {
      updateData.coordinates = coordinates;
    }
    if (timestamp) {
      updateData.timestamp = new Date(timestamp);
    }
    // Always update the tree's overall status to match the latest record's status
    if (status) {
      updateData.status = status;
    }
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    const updatedTree = await Tree.findByIdAndUpdate(treeId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("plantedBy", "name email")
      .populate("siteId", "name address status");

    if (!updatedTree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    try {
      const siteLabel =
        (updatedTree.siteId as { name?: string } | undefined)?.name ?? "site";
      await createNotification(
        "PLANT_RECORD_ADDED",
        String(tree.siteId),
        `New plant record added for '${updatedTree.treeName}' at ${siteLabel}`,
        { treeId },
        req.user?.id ? [req.user.id] : [],
      );
    } catch (_n) {
      /* ignore */
    }

    res
      .status(StatusCodes.OK)
      .json(await signTreeForClient(updatedTree));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Delete a single tree record (image) by its subdocument _id
export const deleteTreeRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { treeId, recordId } = req.params as {
      treeId?: string;
      recordId?: string;
    };

    if (!treeId || !recordId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing treeId or recordId" });
    }

    if (!Types.ObjectId.isValid(treeId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid treeId format" });
    }
    if (!Types.ObjectId.isValid(recordId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid recordId format" });
    }

    const tree = await Tree.findById(treeId).select("images treeName siteId");
    if (!tree) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    }

    const target = (tree.images as any[]).find(
      (img) => String(img._id) === recordId,
    );
    if (!target) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Record not found on this tree" });
    }

    await deleteStoredMediaRef(target);

    // Perform pull using the subdocument _id
    const updateResult = await Tree.updateOne(
      { _id: treeId },
      { $pull: { images: { _id: new Types.ObjectId(recordId) } } },
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to delete record" });
    }

    try {
      const siteRow = await Site.findById(tree.siteId).select("name").lean();
      const siteLabel =
        siteRow && typeof siteRow.name === "string" && siteRow.name.length > 0
          ? siteRow.name
          : "site";
      await createNotification(
        "PLANT_RECORD_DELETED",
        String(tree.siteId),
        `A plant record was removed from '${tree.treeName}' at ${siteLabel}`,
        { treeId, recordId },
        req.user?.id ? [req.user.id] : [],
      );
    } catch (_n) {
      /* ignore */
    }

    const updatedTree = await Tree.findById(treeId)
      .populate("plantedBy", "name email")
      .populate("siteId", "name address status");

    return res.status(StatusCodes.OK).json({
      message: "Record deleted successfully",
      tree: await signTreeForClient(updatedTree),
      deletedRecordId: recordId,
    });
  } catch (err) {
    console.error("[deleteTreeRecord] Error", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const deleteTree = async (req: AuthRequest, res: Response) => {
  try {
    const { treeId } = req.params;

    if (!treeId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing treeId" });

    const tree = await Tree.findById(treeId).populate("siteId", "name");
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    const treeName = tree.treeName;
    const rawSite = tree.siteId as unknown;
    let siteOid: Types.ObjectId;
    let siteLabel = "site";
    if (
      rawSite &&
      typeof rawSite === "object" &&
      "_id" in (rawSite as Record<string, unknown>)
    ) {
      const p = rawSite as { _id: Types.ObjectId; name?: string };
      siteOid = new Types.ObjectId(String(p._id));
      siteLabel =
        typeof p.name === "string" && p.name.length > 0 ? p.name : "site";
    } else {
      siteOid = new Types.ObjectId(String(rawSite));
    }

    await deleteManyStoredMediaRefs(
      (tree.images || []) as { s3Key?: string }[],
    );
    await Tree.deleteOne({ _id: treeId });

    try {
      await createNotification(
        "PLANT_DELETED",
        siteOid,
        `Plant '${treeName}' was deleted from ${siteLabel}`,
        { treeId },
        req.user?.id ? [req.user.id] : [],
      );
    } catch (_n) {
      /* ignore */
    }

    res.status(StatusCodes.OK).json({ message: "Tree deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
