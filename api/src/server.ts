import "dotenv/config";
import express from "express";
import mongoose, { Types } from "mongoose";
// Removed cors package usage to avoid swallowing preflight without headers
import cookieParser from "cookie-parser";
import AuthRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import adminRoute from "./routes/admin.route";
import publicRoute from "./routes/public.route";
import imageRoute from "./routes/image.route";
import notificationRoute from "./routes/notification.route";
import { startS3UploadJob, getS3UploadJobSchedulerState } from "./jobs/s3UploadJob";
// Direct model import for fallback delete route
import Tree from "./models/tree.model";
import { deleteStoredMediaRef } from "./utils/media-upload.util";
import { isS3Configured, getS3Bucket } from "./config/s3.config";
import { signTreeForClient } from "./utils/media-response.util";

if (isS3Configured()) {
  console.log(
    "[S3] Configured for bucket",
    getS3Bucket(),
    "region",
    (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "").trim(),
  );
} else {
  console.log("[S3] Not configured (set S3_BUCKET_NAME, AWS_REGION, AWS keys)");
}

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8000;

const app = express();

// Central CORS handling — primary deployment + optional extras + legacy hosts + localhost
function normalizeOrigin(raw: string): string {
  return raw.trim().replace(/\/$/, "");
}

// FRONTEND_ORIGIN is optional — falls back to harit-infield when unset (see .env.example).
const PRIMARY_FRONTEND_ORIGIN = normalizeOrigin(
  process.env.FRONTEND_ORIGIN ||
    "https://harit-infield.serenticaglobal.com",
);

const EXTRA_FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS_EXTRA || "")
  .split(",")
  .map((s) => normalizeOrigin(s))
  .filter(Boolean);

const LEGACY_FRONTEND_ORIGINS = [
  "https://verdan-beige.vercel.app",
  "https://verdanapp.vercel.app",
];

const allowedOrigins = new Set<string>([
  PRIMARY_FRONTEND_ORIGIN,
  ...EXTRA_FRONTEND_ORIGINS,
  ...LEGACY_FRONTEND_ORIGINS,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:4173",
]);

app.use((req, res, next) => {
  const originHeader = req.headers.origin;
  const normalizedOrigin = originHeader
    ? originHeader.replace(/\/$/, "")
    : undefined;
  const isAllowed = normalizedOrigin
    ? allowedOrigins.has(normalizedOrigin)
    : false;

  // Set CORS headers
  if (originHeader && isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", originHeader);
  } else {
    // For Render deployment, be more permissive but log for monitoring
    res.setHeader("Access-Control-Allow-Origin", originHeader || "*");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-HTTP-Method-Override",
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// Debug route to inspect origin handling
app.get("/debug/origin", (req, res) => {
  res.json({
    receivedOrigin: req.headers.origin || null,
    allowed: req.headers.origin ? allowedOrigins.has(req.headers.origin) : null,
    list: Array.from(allowedOrigins),
  });
});

// Body limit: large enough for base64 payloads before S3 upload processes them
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use(cookieParser());

// Root endpoint for testing
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({
    message: "Harit Backend API is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    origin: req.headers.origin || "No origin",
  });
});

// CORS test endpoint
app.get("/cors-test", (req: express.Request, res: express.Response) => {
  res.json({
    message: "CORS test successful!",
    origin: req.headers.origin || "No origin",
    timestamp: new Date().toISOString(),
    headers: req.headers,
  });
});

// Health check endpoint
app.get("/health", (req: express.Request, res: express.Response) => {
  const s3Worker = getS3UploadJobSchedulerState();
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    s3UploadWorker: {
      ...s3Worker,
      note:
        process.env.VERCEL != null
          ? "Worker disabled on Vercel (no long-lived interval)."
          : s3Worker.schedulerStarted
            ? "Queued /api/images uploads are scanned on this interval."
            : "Worker starts when MongoDB connects.",
    },
  });
});

app.use("/auth", AuthRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/public", publicRoute);
app.use("/api/images", imageRoute);
app.use("/api/notifications", notificationRoute);

// Fallback direct route for deleting a tree record (in case deployed build of admin.route.ts is stale)
app.delete(
  "/admin/trees/:treeId/records/:recordId",
  async (req: express.Request, res: express.Response) => {
    const { treeId, recordId } = req.params;
    // If admin router already registered the route, we can still proceed; this is idempotent.
    try {
      if (!treeId || !recordId) {
        return res.status(400).json({ message: "Missing treeId or recordId" });
      }
      if (!Types.ObjectId.isValid(treeId)) {
        return res.status(400).json({ message: "Invalid treeId format" });
      }
      if (!Types.ObjectId.isValid(recordId)) {
        return res.status(400).json({ message: "Invalid recordId format" });
      }
      const tree = await Tree.findById(treeId).select("images");
      if (!tree) {
        return res.status(404).json({ message: "Tree not found" });
      }
      const target = (tree.images as any[]).find(
        (img) => String(img._id) === recordId,
      );
      if (!target) {
        return res
          .status(404)
          .json({ message: "Record not found on this tree" });
      }
      await deleteStoredMediaRef(target as { s3Key?: string });
      const updateResult = await Tree.updateOne(
        { _id: treeId },
        { $pull: { images: { _id: new Types.ObjectId(recordId) } } },
      );
      if (updateResult.modifiedCount === 0) {
        return res.status(500).json({ message: "Failed to delete record" });
      }
      const updatedTree = await Tree.findById(treeId)
        .populate("plantedBy", "name email")
        .populate("siteId", "name address status");
      return res.status(200).json({
        message: "Record deleted successfully (fallback route)",
        tree: await signTreeForClient(updatedTree),
        deletedRecordId: recordId,
        fallback: true,
      });
    } catch (err: any) {
      console.error("[FallbackDeleteRoute] Error", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// 404 handler for unmatched routes
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.path}`,
    path: req.path,
    method: req.method,
  });
});

mongoose
  .connect(MONGO_URI as string)
  .catch((err) => {
    console.error("error while connecting mongodb", err);
  });

function maybeStartS3UploadJob(): void {
  if (process.env.VERCEL) return;
  if (mongoose.connection.readyState === 1) {
    startS3UploadJob();
    return;
  }
  mongoose.connection.once("connected", () => {
    startS3UploadJob();
  });
}

maybeStartS3UploadJob();

// When deployed on Vercel (@vercel/node) we export the app instead of listening.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
  });
}

export default app;
