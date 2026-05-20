import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { readFile } from "fs/promises";
import path from "path";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";

/**
 * Read S3 settings lazily from process.env. `server.ts` calls `dotenv.config()`
 * after static imports, so module-level reads would miss `.env` values.
 */
function getRegion(): string {
  return (
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    ""
  ).trim();
}

function getBucket(): string {
  return (process.env.S3_BUCKET_NAME || "").trim();
}

function getPublicBase(): string | null {
  const raw = (process.env.S3_PUBLIC_BASE_URL || "").trim().replace(/\/$/, "");
  return raw || null;
}

function getAwsCredentials(): { accessKeyId: string; secretAccessKey: string } {
  return {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID || "").trim(),
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || "").trim(),
  };
}

let client: S3Client | null = null;
let clientCacheKey: string | null = null;

export function isS3Configured(): boolean {
  const { accessKeyId, secretAccessKey } = getAwsCredentials();
  return Boolean(getBucket() && getRegion() && accessKeyId && secretAccessKey);
}

function getClient(): S3Client {
  const region = getRegion();
  const creds = getAwsCredentials();
  const cacheKey = `${region}:${creds.accessKeyId}`;
  if (!client || clientCacheKey !== cacheKey) {
    client = new S3Client({
      region,
      credentials: creds,
    });
    clientCacheKey = cacheKey;
  }
  return client;
}

export function getS3Bucket(): string {
  return getBucket();
}

export function publicUrlForKey(key: string): string {
  const bucket = getBucket();
  const region = getRegion();
  const publicBase = getPublicBase();
  const encoded = key
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  if (publicBase) {
    return `${publicBase}/${encoded}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${encoded}`;
}

/**
 * If the URL points at an object in this app's bucket (or CDN base), return the S3 object key.
 */
export function tryGetS3KeyFromObjectUrl(urlStr: string): string | null {
  const bucket = getBucket();
  const region = getRegion();
  const publicBase = getPublicBase();
  if (!bucket || !region || !urlStr) return null;
  try {
    if (publicBase && urlStr.startsWith(`${publicBase}/`)) {
      const keyPath = urlStr.slice(publicBase.length + 1).split("?")[0];
      return decodeURIComponent(keyPath);
    }
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    const keyPath = decodeURIComponent(
      u.pathname.replace(/^\/+/, "").split("?")[0],
    );
    const vhRegional = `${bucket}.s3.${region}.amazonaws.com`;
    const vhLegacy = `${bucket}.s3.amazonaws.com`;
    const vhDualStack = `${bucket}.s3.dualstack.${region}.amazonaws.com`;
    const vhAccelerate = `${bucket}.s3-accelerate.amazonaws.com`;
    if (
      host === vhRegional ||
      host === vhLegacy ||
      host === vhDualStack ||
      host === vhAccelerate
    ) {
      return keyPath || null;
    }
  } catch {
    return null;
  }
  return null;
}

/** Max allowed by SigV4 presign is 7 days (604800 seconds). */
export function signedUrlExpiresSeconds(): number {
  const n = Number(process.env.S3_SIGNED_URL_EXPIRES_SECONDS);
  if (Number.isFinite(n) && n > 0) return Math.min(Math.floor(n), 604800);
  return 86400;
}

/**
 * Time-limited read URL for a private bucket object (for browser <img src>, etc.).
 */
export async function getSignedGetObjectUrl(
  key: string,
  expiresInSec?: number,
): Promise<string> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured");
  }
  const c = getClient();
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  return getSignedUrl(c, command, {
    expiresIn: expiresInSec ?? signedUrlExpiresSeconds(),
  });
}

export async function uploadBufferToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<{ key: string; url: string }> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured");
  }
  const c = getClient();
  await c.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? "max-age=31536000",
    }),
  );
  return { key: params.key, url: publicUrlForKey(params.key) };
}

/**
 * Map file extension to Content-Type for S3 (images and common types).
 */
export function contentTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".ico": "image/x-icon",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
  };
  return map[ext] || "application/octet-stream";
}

/**
 * Upload a local file to S3 (no object ACL). Use a bucket policy for public GET on a
 * prefix if needed, or serve via presigned URLs (see `resolveMediaUrlForClient`).
 */
export async function uploadLocalFileToS3(params: {
  localPath: string;
  key: string;
}): Promise<{ key: string; url: string }> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured");
  }
  const body = await readFile(params.localPath);
  const contentType = contentTypeFromFilename(params.key);
  const c = getClient();
  await c.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: params.key,
      Body: body,
      ContentType: contentType,
      CacheControl: "max-age=31536000",
    }),
  );
  return { key: params.key, url: publicUrlForKey(params.key) };
}

/** @deprecated Use `uploadLocalFileToS3` (ACLs are not set; bucket policy / presign applies). */
export const uploadLocalFileToS3PublicRead = uploadLocalFileToS3;

export async function deleteS3Object(key: string): Promise<void> {
  if (!key || !isS3Configured()) return;
  try {
    const c = getClient();
    await c.send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
      }),
    );
  } catch (e) {
    console.warn("[S3] deleteObject failed for key", key, e);
  }
}

export function buildObjectKey(prefix: string, ext: string): string {
  const safePrefix = prefix.replace(/^\/+/, "").replace(/\/+$/, "");
  const id = `${Date.now()}-${randomBytes(8).toString("hex")}`;
  return safePrefix ? `${safePrefix}/${id}.${ext}` : `${id}.${ext}`;
}

export function extensionForContentType(contentType: string): string {
  const ct = contentType.split(";")[0].trim().toLowerCase();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
    "application/pdf": "pdf",
  };
  return map[ct] || "bin";
}

function slugify(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const withHyphens = trimmed.replace(/[^a-z0-9-]+/g, "-");
  return withHyphens.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Build a structured S3 object key scoped to a site and optionally a tree/plant.
 * Path format: sites/{siteName}/{treeName or "general"}/{timestamp-randomhex}.{ext}
 * Names are slugified: lowercased, spaces and special chars replaced with hyphens.
 */
export function buildHierarchicalObjectKey(params: {
  siteName: string;
  treeName?: string | null;
  ext: string;
}): string {
  const siteSegment = slugify(params.siteName) || "site";
  const rawTree = params.treeName;
  const hasTree =
    typeof rawTree === "string" && rawTree.trim().length > 0;
  const treeSegment = hasTree
    ? slugify(rawTree as string) || "general"
    : "general";
  const id = `${Date.now()}-${randomBytes(8).toString("hex")}`;
  const ext = params.ext.replace(/^\./, "");
  return `sites/${siteSegment}/${treeSegment}/${id}.${ext}`;
}
