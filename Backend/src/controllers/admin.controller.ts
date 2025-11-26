import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user.model.js";
import Site, { ISite } from "../models/site.model.js";
import Tree from "../models/tree.model.js";
import { sendEmail } from "../utils/email.util.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getAllSites = async (req: Request, res: Response) => {
  try {
    const sites = await Site.find().populate("teamMembers", "-password");
    // Log site IDs for debugging
    const sitesWithIds = sites.map((s: any) => ({
      id: s._id?.toString(),
      idType: typeof s._id,
      name: s.name,
    }));
    console.log("getAllSites - returning sites:", sitesWithIds);

    // Ensure _id is serialized as string in response
    const serializedSites = sites.map((s: any) => ({
      ...s.toObject(),
      _id: s._id.toString(),
    }));

    res.status(StatusCodes.OK).json(serializedSites);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const addSite = async (req: Request, res: Response) => {
  try {
    const { name, address, image, coordinates, status, type } = req.body;

    const site = await Site.create({
      name,
      address,
      image,
      coordinates,
      status,
      type,
    });

    res.status(StatusCodes.CREATED).json(site);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const updateSite = async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const { name, address, image, coordinates, status, type } = req.body;

    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    const site = await Site.findByIdAndUpdate(
      siteId,
      {
        name,
        address,
        image,
        coordinates,
        status,
        type,
      },
      { new: true, runValidators: true }
    );

    if (!site)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Site not found" });

    res.status(StatusCodes.OK).json(site);
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
      "-password"
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

export const addTeamMember = async (req: Request, res: Response) => {
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

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

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
        Types.ObjectId.isValid(id)
      );
      if (validIds.length) {
        await Site.updateMany(
          {
            _id: { $in: validIds.map((id: string) => new Types.ObjectId(id)) },
          },
          { $addToSet: { teamMembers: user._id } }
        );
      }
    } else if (siteId) {
      await Site.findByIdAndUpdate(siteId, {
        $addToSet: { teamMembers: user._id },
      });
    }

    res.status(StatusCodes.CREATED).json({
      message: "Team member created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
export const removeTeamMember = async (req: Request, res: Response) => {
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
      { $pull: { teamMembers: new Types.ObjectId(memberId) } }
    );

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
    console.log("Delete site request received for siteId:", siteId);

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

    console.log("Site found, proceeding with deletion:", site.name);

    // Remove siteId from users who have this site assigned
    // Try both ObjectId and string formats to handle any data inconsistencies
    try {
      const siteObjectId = new Types.ObjectId(siteId);
      const userUpdateResult = await User.updateMany(
        {
          $or: [{ siteId: siteObjectId }, { siteId: siteId }],
        },
        { $unset: { siteId: "" } }
      );
      console.log(`Updated ${userUpdateResult.modifiedCount} users`);
    } catch (userErr: any) {
      console.error("Error updating users:", userErr);
      console.error("User update error details:", userErr?.message);
      // Continue with deletion even if user update fails
    }

    // Delete all trees associated with this site
    // Try both ObjectId and string formats
    try {
      const siteObjectId = new Types.ObjectId(siteId);
      const treeDeleteResult = await Tree.deleteMany({
        $or: [{ siteId: siteObjectId }, { siteId: siteId }],
      });
      console.log(`Deleted ${treeDeleteResult.deletedCount} trees`);
    } catch (treeErr: any) {
      console.error("Error deleting trees:", treeErr);
      console.error("Tree delete error details:", treeErr?.message);
      // Continue with deletion even if tree deletion fails
    }

    // Delete the site
    await Site.findByIdAndDelete(siteId);
    console.log("Site deleted successfully");

    res.status(StatusCodes.OK).json({ message: "Site deleted successfully" });
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

    const tree = await Tree.findByIdAndUpdate(
      treeId,
      { status: "verified" },
      { new: true }
    );
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    res.status(StatusCodes.OK).json(tree);
  } catch (err) {
    console.error(err);
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
    console.log("getSiteById called with siteId:", siteId);
    console.log("siteId type:", typeof siteId);
    console.log("siteId length:", siteId?.length);
    console.log("siteId hex check:", /^[0-9a-fA-F]{24}$/.test(siteId || ""));

    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    // First, get all sites to compare IDs
    const allSites = await Site.find({}, "_id name").lean();
    const allSiteIds = allSites.map((s: any) => s._id.toString());
    console.log(
      "All sites in database:",
      allSites.map((s: any) => ({ id: s._id.toString(), name: s.name }))
    );
    console.log("Looking for siteId:", siteId);
    console.log("Available siteIds:", allSiteIds);

    // Check if siteId matches any existing site (exact match first)
    let matchingSiteId = allSiteIds.find((id) => id === siteId);

    // If no exact match, try case-insensitive match
    if (!matchingSiteId) {
      matchingSiteId = allSiteIds.find(
        (id) => id.toLowerCase() === siteId.toLowerCase()
      );
      if (matchingSiteId) {
        console.log("Found case-insensitive match:", matchingSiteId);
        siteId = matchingSiteId; // Use the matched ID
      }
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(siteId)) {
      console.log("Invalid siteId format:", siteId);
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
          "-password"
        );
      } catch (objIdErr) {
        console.error("Error creating ObjectId:", objIdErr);
      }
    }

    console.log("Site found:", site ? "Yes" : "No");
    if (site) {
      console.log("Site details:", {
        id: (site as any)._id.toString(),
        name: (site as any).name,
      });
      return res.status(StatusCodes.OK).json(site);
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
    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing siteId" });

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(siteId))
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid siteId format" });

    const trees = await Tree.find({ siteId: new Types.ObjectId(siteId) })
      .populate("plantedBy", "name email")
      .sort({ datePlanted: -1 });

    res.status(StatusCodes.OK).json(trees);
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

    const tree = await Tree.create({
      siteId: new Types.ObjectId(siteId),
      plantedBy: new Types.ObjectId(userId),
      treeName,
      treeType,
      coordinates,
      datePlanted: datePlanted ? new Date(datePlanted) : new Date(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: status || "healthy",
      remarks,
      images: images || [],
      verified: false,
    });

    const populatedTree = await Tree.findById(tree._id)
      .populate("plantedBy", "name email")
      .populate("siteId", "name");

    res.status(StatusCodes.CREATED).json(populatedTree);
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
      images,
    } = req.body;

    if (!treeId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing treeId" });

    const updateData: any = {};
    if (treeName) updateData.treeName = treeName;
    if (treeType) updateData.treeType = treeType;
    if (coordinates) updateData.coordinates = coordinates;
    if (datePlanted) updateData.datePlanted = new Date(datePlanted);
    if (timestamp) updateData.timestamp = new Date(timestamp);
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (images !== undefined) {
      // If images array is provided, update it
      updateData.images = images.map((img: any) => ({
        url: img.url,
        timestamp: img.timestamp ? new Date(img.timestamp) : new Date(),
      }));
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

    res.status(StatusCodes.OK).json(tree);
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

    res.status(StatusCodes.OK).json(tree);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const addTreeRecord = async (req: AuthRequest, res: Response) => {
  try {
    console.log("addTreeRecord called with treeId:", req.params.treeId);
    console.log("Request body:", req.body);
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

    // Add new image record to the images array
    const newImage = {
      url: image,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
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

    res.status(StatusCodes.OK).json(updatedTree);
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

    console.log("[deleteTreeRecord] Incoming request", { treeId, recordId });

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

    const tree = await Tree.findById(treeId).select("images");
    if (!tree) {
      console.log("[deleteTreeRecord] Tree not found", treeId);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });
    }

    const target = (tree.images as any[]).find(
      (img) => String(img._id) === recordId
    );
    if (!target) {
      console.log("[deleteTreeRecord] Record not found in tree", {
        recordId,
        treeId,
      });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Record not found on this tree" });
    }

    // Perform pull using the subdocument _id
    const updateResult = await Tree.updateOne(
      { _id: treeId },
      { $pull: { images: { _id: new Types.ObjectId(recordId) } } }
    );

    console.log("[deleteTreeRecord] Pull result", updateResult);

    if (updateResult.modifiedCount === 0) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to delete record" });
    }

    const updatedTree = await Tree.findById(treeId)
      .populate("plantedBy", "name email")
      .populate("siteId", "name address status");

    return res.status(StatusCodes.OK).json({
      message: "Record deleted successfully",
      tree: updatedTree,
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

    const tree = await Tree.findByIdAndDelete(treeId);

    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    res.status(StatusCodes.OK).json({ message: "Tree deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
