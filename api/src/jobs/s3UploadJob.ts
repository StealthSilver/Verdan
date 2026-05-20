import path from "path";
import { access, unlink } from "fs/promises";
import Image, { IImage } from "../models/image.model";
import { isS3Configured, uploadLocalFileToS3 } from "../config/s3.config";

const INTERVAL_MS = 120_000;

let schedulerStarted = false;
let lastRunAtIso: string | null = null;
let lastRunPending = 0;
let lastRunSuccesses = 0;
let lastRunFailures = 0;

/** For `/health` or ops: confirms the 120s worker was started and last sweep result. */
export function getS3UploadJobSchedulerState(): {
  schedulerStarted: boolean;
  intervalSeconds: number;
  lastRunAt: string | null;
  lastRunPending: number;
  lastRunSuccesses: number;
  lastRunFailures: number;
} {
  return {
    schedulerStarted,
    intervalSeconds: INTERVAL_MS / 1000,
    lastRunAt: lastRunAtIso,
    lastRunPending,
    lastRunSuccesses,
    lastRunFailures,
  };
}

function originalFilenameFromLocalPath(localPath: string): string {
  const base = path.basename(localPath);
  const m = /^\d+-(.+)$/.exec(base);
  return m ? m[1] : base;
}

async function processOne(doc: IImage): Promise<"success" | "failure"> {
  const localPath = doc.localImagePath;
  if (!localPath) return "failure";

  try {
    await access(localPath);
  } catch {
    console.warn(
      "[s3UploadJob] Local file missing; clearing localImagePath",
      localPath,
    );
    await Image.updateOne(
      { _id: doc._id },
      { $set: { localImagePath: null, s3Uploaded: false } },
    );
    return "failure";
  }

  const original = originalFilenameFromLocalPath(localPath);
  const key = `images/${Date.now()}-${original}`;

  try {
    const { url } = await uploadLocalFileToS3({
      localPath,
      key,
    });
    await Image.updateOne(
      { _id: doc._id },
      {
        $set: {
          imageUrl: url,
          s3Uploaded: true,
          localImagePath: null,
        },
      },
    );
    try {
      await unlink(localPath);
    } catch (e) {
      console.warn("[s3UploadJob] Failed to delete temp file", localPath, e);
    }
    return "success";
  } catch (err) {
    console.error("[s3UploadJob] S3 upload failed for", doc._id, err);
    return "failure";
  }
}

export async function runS3UploadJobOnce(): Promise<void> {
  const started = new Date().toISOString();
  lastRunAtIso = started;
  if (!isS3Configured()) {
    console.warn("[s3UploadJob] Skip run at", started, "- S3 not configured");
    lastRunPending = 0;
    lastRunSuccesses = 0;
    lastRunFailures = 0;
    return;
  }

  try {
    const pending = await Image.find({
      s3Uploaded: false,
      localImagePath: { $ne: null },
    });

    console.log(
      "[s3UploadJob] Start",
      started,
      "pending count:",
      pending.length,
    );

    let successes = 0;
    let failures = 0;

    const results = await Promise.allSettled(
      pending.map((doc) => processOne(doc)),
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value === "success") successes += 1;
        else failures += 1;
      } else {
        failures += 1;
        console.error("[s3UploadJob] Unexpected rejection", r.reason);
      }
    }

    lastRunPending = pending.length;
    lastRunSuccesses = successes;
    lastRunFailures = failures;

    console.log(
      "[s3UploadJob] Done successes:",
      successes,
      "failures:",
      failures,
      "(next run in",
      INTERVAL_MS / 1000,
      "s)",
    );
  } catch (err) {
    console.error("[s3UploadJob] Batch error (will retry next cycle)", err);
    lastRunPending = 0;
    lastRunSuccesses = 0;
    lastRunFailures = 0;
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Runs every 120 seconds. No-op on serverless (caller should skip).
 */
export function startS3UploadJob(): void {
  if (intervalId) return;
  schedulerStarted = true;
  console.log(
    "[s3UploadJob] Background worker started: runs now, then every",
    INTERVAL_MS / 1000,
    "seconds while the process is up (Mongo connected, not VERCEL).",
  );
  void runS3UploadJobOnce();
  intervalId = setInterval(() => {
    void runS3UploadJobOnce();
  }, INTERVAL_MS);
}
