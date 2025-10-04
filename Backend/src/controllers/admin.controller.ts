// controllers/admin.controller.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import Site from "../models/site.model.js";
import User from "../models/user.model.js";
import Tree from "../models/tree.model.js";
import { sendEmail } from "../utils/email.util";

export const getAllSites = async (req: Request, res: Response) => {
  try {
    const sites = await Site.find().populate("members", "name email role");
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

export const getTeamForSite = async (req: Request, res: Response) => {
  try {
    const siteId = req.query.siteId as string;
    if (!siteId)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "siteId required" });

    const users = await User.find({
      siteId: new Types.ObjectId(siteId),
    }).select("name email role designation gender");
    res.status(StatusCodes.OK).json(users);
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

    if (!name || !email || !role || !siteId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email already exists" });
    }

    // Generate a random password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      name,
      email,
      role,
      siteId: new Types.ObjectId(siteId),
      gender: gender || "other",
      designation,
      password: hashedPassword,
    });

    // Send email to the new user
    await sendEmail(
      newUser.email,
      "Your account has been created",
      `<p>Hello ${newUser.name},</p>
       <p>Your account has been created with role <strong>${role}</strong> for site ID <strong>${siteId}</strong>.</p>
       <p>Username: ${newUser.email}<br>Password: ${plainPassword}</p>
       <p>Please change your password after first login.</p>`
    );

    res.status(StatusCodes.CREATED).json({
      message: "User created and email sent successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        siteId: newUser.siteId,
        gender: newUser.gender,
        designation: newUser.designation,
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
        .json({ message: "treeId required" });

    const tree = await Tree.findById(treeId);
    if (!tree)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tree not found" });

    tree.status = "verified";
    await tree.save();

    res
      .status(StatusCodes.OK)
      .json({ message: "Tree verified successfully", tree });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
