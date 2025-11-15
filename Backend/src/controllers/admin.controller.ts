import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user.model.js";
import Site, { ISite } from "../models/site.model.js";
import Tree from "../models/tree.model.js";
import { sendEmail } from "../utils/email.util.js";

export const getAllSites = async (req: Request, res: Response) => {
  try {
    const sites = await Site.find().populate("teamMembers", "-password");
    res.status(StatusCodes.OK).json(sites);
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
    const { name, email, role, siteId, gender, designation } = req.body;
    if (!name || !email || !role || !siteId || !designation)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email already registered" });

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      role,
      siteId: new Types.ObjectId(siteId),
      password: hashedPassword,
      gender: gender || "other",
      designation,
    });

    await Site.findByIdAndUpdate(siteId, { $push: { teamMembers: user._id } });

    const site = await Site.findById(siteId);
    if (site) {
      const html = `
        <h3>Welcome to ${site.name}</h3>
        <p>Your account has been created by the admin.</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: ${password}</li>
          <li>Role: ${role}</li>
        </ul>
        <p>Please login and change your password.</p>
      `;
      await sendEmail(email, `Your account for ${site.name}`, html);
    }

    res.status(StatusCodes.CREATED).json({
      message: "User created and email sent successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        siteId: user.siteId,
        gender: user.gender,
        designation: user.designation,
      },
    });
  } catch (err) {
    console.error(err);
    res
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
          $or: [
            { siteId: siteObjectId },
            { siteId: siteId }
          ]
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
        $or: [
          { siteId: siteObjectId },
          { siteId: siteId }
        ]
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
