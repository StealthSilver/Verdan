import { unlink } from "fs/promises";
import path from "path";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import Image from "../models/image.model";
import { isS3Configured, uploadLocalFileToS3 } from "../config/s3.config";
import { resolveMediaUrlForClient } from "../utils/media-response.util";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file?.path) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing image file (field name: image)",
      });
    }

    if (isS3Configured()) {
      const safeName =
        path.basename(file.originalname || "image").replace(/[^\w.-]+/g, "_") ||
        "image";
      const key = `images/${Date.now()}-${safeName}`;
      try {
        const { url } = await uploadLocalFileToS3({
          localPath: file.path,
          key,
        });
        try {
          await unlink(file.path);
        } catch (e) {
          console.warn("[uploadImage] Failed to remove temp file", file.path, e);
        }
        const doc = await Image.create({
          localImagePath: null,
          imageUrl: url,
          s3Uploaded: true,
        });
        const imageUrl = (await resolveMediaUrlForClient({ url })) ?? url;
        return res.status(StatusCodes.CREATED).json({
          success: true,
          message: "Image uploaded to S3",
          documentId: String(doc.id),
          imageUrl,
        });
      } catch (uploadErr) {
        console.error(
          "[uploadImage] S3 upload failed; keeping local file for background job",
          uploadErr,
        );
      }
    }

    const doc = await Image.create({
      localImagePath: file.path,
      imageUrl: null,
      s3Uploaded: false,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Image queued for upload",
      documentId: String(doc.id),
    });
  } catch (err) {
    console.error("[uploadImage]", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid document id" });
    }

    const doc = await Image.findById(id).lean();
    if (!doc) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
    }

    if (!doc.imageUrl) {
      return res.status(StatusCodes.OK).json({
        status: "processing",
        message: "Image is being uploaded to S3",
      });
    }

    const imageUrl =
      (await resolveMediaUrlForClient({ url: doc.imageUrl })) ?? doc.imageUrl;
    return res.status(StatusCodes.OK).json({ ...doc, imageUrl });
  } catch (err) {
    console.error("[getImageById]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

export const listImages = async (_req: Request, res: Response) => {
  try {
    const docs = await Image.find().sort({ createdAt: -1 }).lean();
    const withUrls = await Promise.all(
      docs.map(async (d) => {
        if (!d.imageUrl) return d;
        const imageUrl =
          (await resolveMediaUrlForClient({ url: d.imageUrl })) ?? d.imageUrl;
        return { ...d, imageUrl };
      }),
    );
    return res.status(StatusCodes.OK).json(withUrls);
  } catch (err) {
    console.error("[listImages]", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
