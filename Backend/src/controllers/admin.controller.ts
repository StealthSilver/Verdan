import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user.model.js";
import Site, { ISite } from "../models/site.model.js";
import Tree from "../models/tree.model.js";
import { sendEmail } from "../utils/email.util";

// Get all sites (with team members)
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

// Add a new site
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
