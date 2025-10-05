import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.model";
import Site from "../models/site.model";
import Tree from "../models/tree.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Types } from "mongoose";

export const getUserDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });

    const user = await User.findById(userId).populate(
      "siteId",
      "name location status"
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
      "treeName coordinates datePlanted status"
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

    res.status(StatusCodes.OK).json(tree);
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

    const { treeName, coordinates, image, status, remarks } = req.body;

    if (!treeName || !coordinates || !image)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing fields" });

    const normalizedCoordinates = {
      lat: coordinates.lat || coordinates.latitude,
      lng: coordinates.lng || coordinates.longitude,
    };

    const tree = await Tree.create({
      treeName,
      coordinates: normalizedCoordinates,
      image,
      plantedBy: new Types.ObjectId(userId),
      siteId: new Types.ObjectId(user.siteId),
      datePlanted: new Date(),
      status: status || "healthy",
      remarks: remarks || "",
      history: [
        {
          image,
          timestamp: new Date(),
          remarks: remarks || "",
        },
      ],
    });

    res.status(StatusCodes.CREATED).json(tree);
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
