import {
  buildHierarchicalObjectKey,
  buildObjectKey,
  deleteS3Object,
  extensionForContentType,
  isS3Configured,
  tryGetS3KeyFromObjectUrl,
  uploadBufferToS3,
} from "../config/s3.config";

/** When set, new S3 keys use sites/{site}/{tree|general}/… instead of a flat prefix. */
export type HierarchicalUploadContext = {
  siteName: string;
  treeName?: string | null;
};

export interface StoredMediaRef {
  url: string;
  timestamp: Date;
  /** Set when the file lives in S3 (for cleanup on delete). */
  s3Key?: string;
}

const DATA_URL_RE = /^data:([^;,]+)(;charset=[^;,]+)?;base64,(.+)$/i;

export function parseDataUrl(
  dataUrl: string,
): { buffer: Buffer; contentType: string } | null {
  const m = DATA_URL_RE.exec(dataUrl.trim());
  if (!m) return null;
  const contentType = m[1].trim();
  try {
    const buffer = Buffer.from(m[3], "base64");
    return { buffer, contentType };
  } catch {
    return null;
  }
}

/**
 * If value is a base64 data URL and S3 is configured, uploads and returns public URL + key.
 * If already an http(s) URL, returns as-is (no re-upload).
 * If S3 is not configured, keeps data URL in `url` (legacy behavior).
 */
export async function normalizeMediaInput(
  value: string,
  keyPrefix: string,
  hierarchical?: HierarchicalUploadContext,
): Promise<StoredMediaRef> {
  const ts = new Date();
  if (!value || typeof value !== "string") {
    return { url: "", timestamp: ts };
  }
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const existingKey = tryGetS3KeyFromObjectUrl(trimmed);
    return {
      url: trimmed,
      timestamp: ts,
      ...(existingKey ? { s3Key: existingKey } : {}),
    };
  }
  const parsed = parseDataUrl(trimmed);
  if (!parsed) {
    return { url: trimmed, timestamp: ts };
  }
  if (!isS3Configured()) {
    return { url: trimmed, timestamp: ts };
  }
  const ext = extensionForContentType(parsed.contentType);
  const key =
    hierarchical && typeof hierarchical.siteName === "string"
      ? buildHierarchicalObjectKey({
          siteName: hierarchical.siteName,
          treeName: hierarchical.treeName,
          ext,
        })
      : buildObjectKey(keyPrefix, ext);
  const { url } = await uploadBufferToS3({
    key,
    body: parsed.buffer,
    contentType: parsed.contentType,
  });
  return { url, timestamp: ts, s3Key: key };
}

export async function normalizeImageInput(
  value: string,
  keyPrefix: string,
  hierarchical?: HierarchicalUploadContext,
): Promise<StoredMediaRef> {
  return normalizeMediaInput(value, keyPrefix, hierarchical);
}

/** Normalize tree image subdocs from API (may include data URLs or URLs). */
export async function normalizeTreeImageItems(
  items: Array<{ url?: string; timestamp?: string | Date } | string>,
  keyPrefix: string,
  hierarchical?: HierarchicalUploadContext,
): Promise<StoredMediaRef[]> {
  const out: StoredMediaRef[] = [];
  for (const item of items) {
    const url = typeof item === "string" ? item : item?.url;
    if (!url) continue;
    const ts = (
      typeof item === "object" && item?.timestamp
        ? new Date(item.timestamp as string | Date)
        : new Date()
    ) as Date;
    const normalized = await normalizeMediaInput(url, keyPrefix, hierarchical);
    out.push({ ...normalized, timestamp: ts });
  }
  return out;
}

export async function deleteStoredMediaRef(ref: {
  s3Key?: string;
}): Promise<void> {
  if (ref.s3Key) {
    await deleteS3Object(ref.s3Key);
  }
}

export async function deleteManyStoredMediaRefs(
  refs: Array<{ s3Key?: string }>,
): Promise<void> {
  for (const r of refs) {
    await deleteStoredMediaRef(r);
  }
}

/** After replacing the images array, delete S3 objects that are no longer referenced. */
export function obsoleteS3RefsAfterImageReplace(
  oldList: Array<{ url: string; s3Key?: string }>,
  newList: Array<{ url: string; s3Key?: string }>,
): Array<{ s3Key: string }> {
  const newUrls = new Set(newList.map((n) => n.url));
  const newKeys = new Set(
    newList.map((n) => n.s3Key).filter(Boolean) as string[],
  );
  const out: Array<{ s3Key: string }> = [];
  for (const old of oldList) {
    if (!old.s3Key) continue;
    if (newKeys.has(old.s3Key)) continue;
    if (newUrls.has(old.url)) continue;
    out.push({ s3Key: old.s3Key });
  }
  return out;
}
