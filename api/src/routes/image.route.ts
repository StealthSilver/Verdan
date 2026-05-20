import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import {
  getImageById,
  listImages,
  uploadImage,
} from "../controllers/image.controller";

export const LOCAL_UPLOAD_ROOT =
  process.env.LOCAL_IMAGE_UPLOAD_DIR || path.join("/tmp", "uploads");

function ensureUploadDir(): void {
  fs.mkdirSync(LOCAL_UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, LOCAL_UPLOAD_ROOT);
  },
  filename: (_req, file, cb) => {
    const safe = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe || "image"}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

const router = Router();

router.post("/upload", upload.single("image"), uploadImage);
router.get("/", listImages);
router.get("/:id", getImageById);

export default router;
