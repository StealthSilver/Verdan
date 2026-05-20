import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.model";
import Site from "../models/site.model";
import Tree from "../models/tree.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Types } from "mongoose";
import {
  deleteManyStoredMediaRefs,
  deleteStoredMediaRef,
  normalizeImageInput,
  normalizeTreeImageItems,
  obsoleteS3RefsAfterImageReplace,
} from "../utils/media-upload.util";
import {
  signTreeForClient,
  signTreesForClient,
} from "../utils/media-response.util";
import { createNotification } from "../utils/notificationHelper.js";

export const getUserDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const user = await User.findById(userId).populate(
      "siteId",
      "name location status",
    );
    if (!user || !user.siteId)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });

    const site = user.siteId as any;
    res.status(StatusCodes.OK).json({
      siteId: site._id,
      siteName: site.name,
      location: site.location,
      status: site.status,
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });

    res.status(StatusCodes.OK).json(user);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getSiteDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user || !user.siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User has no site assigned" });

    const trees = await Tree.find({ siteId: user.siteId }).select(
      "treeName coordinates datePlanted status verified",
    );

    res.status(StatusCodes.OK).json({ count: trees.length, trees });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const getTreeDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { treeId } = req.params;
    if (!treeId || !Types.ObjectId.isValid(treeId))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid tree ID" });

    const tree = await Tree.findById(treeId);
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    res
      .status(StatusCodes.OK)
      .json(await signTreeForClient(tree));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const addTree = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user || !user.siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User has no site assigned" });

    const { treeName, coordinates, image, images, status, remarks, plantedBy } =
      req.body;

    if (!treeName || !coordinates || (!image && !images))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });

    const normalizedCoordinates = {
      lat: coordinates.lat || coordinates.latitude,
      lng: coordinates.lng || coordinates.longitude,
    };

    const siteDoc = await Site.findById(user.siteId).select("name").lean();
    const hierarchical = {
      siteName: (siteDoc as { name?: string } | null)?.name ?? "",
      treeName: treeName as string,
    };

    // Normalize incoming image(s); upload data URLs to S3 when configured
    let imagesArray: { url: string; timestamp: Date; s3Key?: string }[] = [];
    const mediaPrefix = `trees/${String(user.siteId)}/new`;
    if (Array.isArray(images) && images.length) {
      imagesArray = await normalizeTreeImageItems(
        images,
        mediaPrefix,
        hierarchical,
      );
    } else if (image) {
      const one = await normalizeImageInput(
        String(image),
        mediaPrefix,
        hierarchical,
      );
      imagesArray = [
        {
          url: one.url,
          timestamp: new Date(),
          ...(one.s3Key ? { s3Key: one.s3Key } : {}),
        },
      ];
    }

    const tree = await Tree.create({
      treeName,
      coordinates: normalizedCoordinates,
      plantedBy: new Types.ObjectId(userId),
      plantedByName: plantedBy,
      siteId: new Types.ObjectId(user.siteId as any),
      datePlanted: new Date(),
      timestamp: new Date(),
      status: status || "healthy",
      remarks: remarks || "",
      images: imagesArray,
      verified: false,
    });

    const populated = await Tree.findById(tree._id)
      .populate("plantedBy", "name email")
      .populate("siteId", "name status address");

    res
      .status(StatusCodes.CREATED)
      .json(await signTreeForClient(populated));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// List sites assigned to the logged-in user (admins see all)
export const getAssignedSites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    // For non-admin users restrict to sites where they are a team member; admins see all.
    const query = role === "admin" ? {} : ({ teamMembers: userId } as any);
    // Select real field names present on Site model: address & coordinates (location was not a schema field)
    const sites = await Site.find(query)
      .select("name address status coordinates")
      .lean();
    return res.status(StatusCodes.OK).json(sites);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// List trees for a site the user has access to
export const getSiteTrees = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { siteId } = req.params;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (!siteId || !Types.ObjectId.isValid(siteId))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid site ID" });

    if (role !== "admin") {
      const site = await Site.findOne({ _id: siteId, teamMembers: userId });
      if (!site)
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }

    // Get total count for pagination
    const totalCount = await Tree.countDocuments({ siteId });

    const trees = await Tree.find({ siteId })
      .select(
        "treeName treeType coordinates datePlanted timestamp status remarks verified plantedBy images",
      )
      .populate("plantedBy", "name email")
      .sort({ datePlanted: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(StatusCodes.OK).json({
      count: trees.length,
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

// Update a tree within a site (only if site is accessible)
export const updateTree = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { siteId, treeId } = req.params as any;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (
      !siteId ||
      !Types.ObjectId.isValid(siteId) ||
      !treeId ||
      !Types.ObjectId.isValid(treeId)
    )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid IDs" });

    if (role !== "admin") {
      const site = await Site.findOne({ _id: siteId, teamMembers: userId });
      if (!site)
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }

    const existing = await Tree.findOne({ _id: treeId, siteId });
    if (!existing)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    const updatePayload: Record<string, unknown> = { ...req.body };
    // Frontend may send plantedBy as a display string; Tree.plantedBy expects ObjectId.
    // Map plantedBy -> plantedByName to avoid ObjectId cast errors.
    if (
      Object.prototype.hasOwnProperty.call(updatePayload, "plantedBy") &&
      typeof (updatePayload as any).plantedBy === "string"
    ) {
      (updatePayload as any).plantedByName = (updatePayload as any).plantedBy;
      delete (updatePayload as any).plantedBy;
    }
    if (Array.isArray(updatePayload.images)) {
      const siteDoc = await Site.findById(siteId).select("name").lean();
      const siteName = (siteDoc as { name?: string } | null)?.name ?? "";
      const treeNameForKey =
        typeof updatePayload.treeName === "string" &&
        (updatePayload.treeName as string).trim()
          ? (updatePayload.treeName as string)
          : existing.treeName;
      const newImages = await normalizeTreeImageItems(
        updatePayload.images as { url?: string; timestamp?: string | Date }[],
        `trees/${siteId}/${treeId}`,
        { siteName, treeName: treeNameForKey },
      );
      const obsolete = obsoleteS3RefsAfterImageReplace(
        existing.images as { url: string; s3Key?: string }[],
        newImages,
      );
      await deleteManyStoredMediaRefs(obsolete);
      updatePayload.images = newImages;
    }

    const tree = await Tree.findOneAndUpdate(
      { _id: treeId, siteId },
      updatePayload,
      { new: true },
    );
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    try {
      const siteRow = await Site.findById(siteId).select("name").lean();
      const siteLabel =
        siteRow &&
        typeof siteRow.name === "string" &&
        siteRow.name.length > 0
          ? siteRow.name
          : "site";
      await createNotification(
        "PLANT_UPDATED",
        siteId,
        `Plant '${tree.treeName}' was updated in ${siteLabel}`,
        { treeId },
        userId ? [userId] : [],
      );
    } catch (_n) {
      /* ignore */
    }
    return res.status(StatusCodes.OK).json(await signTreeForClient(tree));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Delete a tree within a site (only if site is accessible)
export const deleteTree = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { siteId, treeId } = req.params as any;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (
      !siteId ||
      !Types.ObjectId.isValid(siteId) ||
      !treeId ||
      !Types.ObjectId.isValid(treeId)
    )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid IDs" });

    if (role !== "admin") {
      const site = await Site.findOne({ _id: siteId, teamMembers: userId });
      if (!site)
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }

    const toRemove = await Tree.findOne({ _id: treeId, siteId });
    if (!toRemove)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    try {
      const siteRow = await Site.findById(siteId).select("name").lean();
      const siteLabel =
        siteRow &&
        typeof siteRow.name === "string" &&
        siteRow.name.length > 0
          ? siteRow.name
          : "site";
      await createNotification(
        "PLANT_DELETED",
        siteId,
        `Plant '${toRemove.treeName}' was deleted from ${siteLabel}`,
        { treeId },
        userId ? [userId] : [],
      );
    } catch (_n) {
      /* ignore */
    }
    await deleteManyStoredMediaRefs(
      (toRemove.images || []) as { s3Key?: string }[],
    );
    await Tree.deleteOne({ _id: treeId, siteId });
    return res.status(StatusCodes.OK).json({ ok: true });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Get single tree within an accessible site
export const getSiteTree = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { siteId, treeId } = req.params as any;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (
      !siteId ||
      !treeId ||
      !Types.ObjectId.isValid(siteId) ||
      !Types.ObjectId.isValid(treeId)
    )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid IDs" });
    if (role !== "admin") {
      const site = await Site.findOne({ _id: siteId, teamMembers: userId });
      if (!site)
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }
    const tree = await Tree.findOne({ _id: treeId, siteId })
      .populate("plantedBy", "name email")
      .populate("siteId", "name status address");
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

    return res.status(StatusCodes.OK).json(await signTreeForClient(tree));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Create a new tree within an accessible site
export const createTreeInSite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { siteId } = req.params as any;
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
      image, // allow single image convenience
    } = req.body;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (!siteId || !Types.ObjectId.isValid(siteId))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid site ID" });
    if (!treeName || !coordinates)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });
    // Access check for non-admin
    if (role !== "admin") {
      const accessible = await Site.findOne({
        _id: siteId,
        teamMembers: userId,
      });
      if (!accessible)
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }
    const siteDoc = await Site.findById(siteId).select("name").lean();
    const hierarchical = {
      siteName: (siteDoc as { name?: string } | null)?.name ?? "",
      treeName: treeName as string,
    };

    let imagesArray: { url: string; timestamp: Date; s3Key?: string }[] = [];
    const mediaPrefix = `trees/${siteId}/new`;
    if (images && Array.isArray(images) && images.length) {
      imagesArray = await normalizeTreeImageItems(
        images,
        mediaPrefix,
        hierarchical,
      );
    } else if (image) {
      const one = await normalizeImageInput(
        String(image),
        mediaPrefix,
        hierarchical,
      );
      imagesArray = [
        {
          url: one.url,
          timestamp: new Date(),
          ...(one.s3Key ? { s3Key: one.s3Key } : {}),
        },
      ];
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
      images: imagesArray,
      verified: false,
    });
    const populated = await Tree.findById(tree._id)
      .populate("plantedBy", "name email")
      .populate("siteId", "name status address");
    try {
      const siteLabel =
        (populated?.siteId as { name?: string } | undefined)?.name ?? "site";
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
    return res
      .status(StatusCodes.CREATED)
      .json(await signTreeForClient(populated));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Add a tree record (image + optional fields) within accessible site
export const addTreeRecordInSite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { siteId, treeId } = req.params as any;
    const { image, coordinates, timestamp, status, remarks } = req.body;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (
      !siteId ||
      !treeId ||
      !Types.ObjectId.isValid(siteId) ||
      !Types.ObjectId.isValid(treeId)
    )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid IDs" });
    if (!image)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Image is required" });
    if (role !== "admin") {
      const site = await Site.findOne({ _id: siteId, teamMembers: userId });
      if (!site)
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }
    const tree = await Tree.findOne({ _id: treeId, siteId });
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    const siteDoc = await Site.findById(siteId).select("name").lean();
    const uploaded = await normalizeImageInput(
      String(image),
      `trees/${siteId}/${treeId}/records`,
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
    const update: any = { $push: { images: newImage } };
    if (coordinates) update.coordinates = coordinates;
    // Always update the tree's overall status to match the latest record's status
    if (status) update.status = status;
    if (remarks !== undefined) update.remarks = remarks;
    if (timestamp) update.timestamp = new Date(timestamp);
    const updated = await Tree.findByIdAndUpdate(treeId, update, {
      new: true,
      runValidators: true,
    })
      .populate("plantedBy", "name email")
      .populate("siteId", "name status address");
    if (!updated)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    try {
      const siteLabel =
        (updated.siteId as { name?: string } | undefined)?.name ?? "site";
      await createNotification(
        "PLANT_RECORD_ADDED",
        siteId,
        `New plant record added for '${updated.treeName}' at ${siteLabel}`,
        { treeId },
        userId ? [userId] : [],
      );
    } catch (_n) {
      /* ignore */
    }
    return res.status(StatusCodes.OK).json(await signTreeForClient(updated));
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

// Delete a tree record (image) within accessible site
export const deleteTreeRecordInSite = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { siteId, treeId, recordId } = req.params as any;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    if (
      !siteId ||
      !treeId ||
      !recordId ||
      !Types.ObjectId.isValid(siteId) ||
      !Types.ObjectId.isValid(treeId) ||
      !Types.ObjectId.isValid(recordId)
    )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid IDs" });
    if (role !== "admin") {
      const site = await Site.findOne({ _id: siteId, teamMembers: userId });
      if (!site)
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }
    const tree = await Tree.findOne({ _id: treeId, siteId }).select(
      "images treeName siteId",
    );
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    const target = (tree.images as any[]).find(
      (img) => String(img._id) === recordId,
    );
    if (!target)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Record not found" });
    await deleteStoredMediaRef(target);
    await Tree.updateOne(
      { _id: treeId },
      { $pull: { images: { _id: new Types.ObjectId(recordId) } } },
    );
    try {
      const siteRow = await Site.findById(siteId).select("name").lean();
      const siteLabel =
        siteRow && typeof siteRow.name === "string" && siteRow.name.length > 0
          ? siteRow.name
          : "site";
      await createNotification(
        "PLANT_RECORD_DELETED",
        siteId,
        `A plant record was removed from '${tree.treeName}' at ${siteLabel}`,
        { treeId, recordId },
        userId ? [userId] : [],
      );
    } catch (_n) {
      /* ignore */
    }
    const updated = await Tree.findById(treeId)
      .populate("plantedBy", "name email")
      .populate("siteId", "name status address");
    return res.status(StatusCodes.OK).json({
      message: "Record deleted",
      tree: await signTreeForClient(updated),
      deletedRecordId: recordId,
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
