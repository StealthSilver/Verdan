import { Request, Response } from "express";
import Tree from "../models/tree.model";

/**
 * Get public tree details without authentication
 * Returns read-only tree information
 */
export const getPublicTreeById = async (req: Request, res: Response) => {
  try {
    const { treeId } = req.params;

    if (!treeId) {
      return res.status(400).json({ message: "Tree ID is required" });
    }

    const tree = await Tree.findById(treeId)
      .populate("siteId", "name status")
      .populate("plantedBy", "name")
      .select("-__v");

    if (!tree) {
      return res.status(404).json({ message: "Tree not found" });
    }

    // Return tree data in read-only format
    res.status(200).json({
      success: true,
      tree,
      isPublic: true,
    });
  } catch (error: any) {
    console.error("Error fetching public tree:", error);
    res.status(500).json({
      message: "Failed to fetch tree details",
      error: error.message,
    });
  }
};
