/**
 * `crossOrigin` for <img> when src may be HTTPS. Use `anonymous` only when the origin
 * sends CORS headers that allow this site — otherwise the image request fails and you
 * get a broken / fallback image.
 *
 * S3 presigned URLs and plain virtual-hosted S3 URLs typically do **not** include
 * `Access-Control-Allow-Origin` unless the bucket has a CORS rule, so we omit
 * `crossOrigin` for those. Images then load for display; canvas-based flows may need
 * bucket CORS + `anonymous` (see AWS S3 CORS docs for your portal origins).
 */
function isAwsObjectStorageUrl(src: string): boolean {
  if (/[?&]X-Amz-/.test(src)) return true;
  try {
    const h = new URL(src).hostname.toLowerCase();
    return (
      h.endsWith(".amazonaws.com") ||
      h.endsWith(".amazon.com") ||
      h.endsWith(".cloudfront.net")
    );
  } catch {
    return false;
  }
}

export function crossOriginForRemoteImage(
  src: string | null | undefined,
): "anonymous" | undefined {
  if (!src) return undefined;
  if (src.startsWith("data:")) return undefined;
  if (src.startsWith("blob:")) return undefined;
  if (src.startsWith("/")) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    if (isAwsObjectStorageUrl(src)) return undefined;
    return "anonymous";
  }
  return undefined;
}
