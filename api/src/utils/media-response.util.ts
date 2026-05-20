import {
  getSignedGetObjectUrl,
  isS3Configured,
  tryGetS3KeyFromObjectUrl,
} from "../config/s3.config";

/**
 * Signed GET URL for our bucket, or the original URL (data URL, external http, legacy public object URL).
 */
export async function resolveMediaUrlForClient(ref: {
  url?: string;
  s3Key?: string;
}): Promise<string | undefined> {
  const raw = ref.url;
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "string" && raw.startsWith("data:")) return raw;

  const key =
    ref.s3Key ??
    (typeof raw === "string" && raw.length > 0
      ? tryGetS3KeyFromObjectUrl(raw)
      : null);

  if (key && isS3Configured()) {
    try {
      return await getSignedGetObjectUrl(key);
    } catch (e) {
      console.warn("[S3] presign failed for key", key, e);
    }
  }

  return raw;
}

function toPlain<T>(doc: T): Record<string, unknown> {
  const d: any = doc;
  if (doc != null && typeof d.toObject === "function") return d.toObject();
  return { ...d };
}

export async function signTreeImageEntry(img: unknown): Promise<unknown> {
  if (!img || typeof img !== "object") return img;
  const row = img as Record<string, unknown>;
  const { s3Key, ...rest } = row;
  const url = await resolveMediaUrlForClient({
    url: rest.url as string | undefined,
    s3Key: s3Key as string | undefined,
  });
  return { ...rest, url: url ?? rest.url };
}

export async function signTreeForClient(tree: unknown): Promise<unknown> {
  if (!tree) return tree;
  const plain = toPlain(tree) as Record<string, unknown>;
  if (Array.isArray(plain.images) && plain.images.length > 0) {
    plain.images = await Promise.all(plain.images.map(signTreeImageEntry));
  }
  return plain;
}

export async function signTreesForClient(trees: unknown[]): Promise<unknown[]> {
  return Promise.all(trees.map((t) => signTreeForClient(t)));
}

export async function signSiteForClient(site: unknown): Promise<unknown> {
  if (!site) return site;
  const plain = toPlain(site) as Record<string, unknown>;
  if (plain.image && typeof plain.image === "string") {
    const signed = await resolveMediaUrlForClient({ url: plain.image });
    if (signed) plain.image = signed;
  }
  return plain;
}

export async function signSitesForClient(sites: unknown[]): Promise<unknown[]> {
  return Promise.all(sites.map((s) => signSiteForClient(s)));
}
