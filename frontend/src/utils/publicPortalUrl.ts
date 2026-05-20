/**
 * Public portal origin for links shared outside the app (e.g. QR codes).
 *
 * Resolution order (always works without .env — fallbacks are hardcoded):
 * 1. `VITE_BASE_URL` if set and not a retired legacy host
 * 2. In the browser: `window.location.origin` (local dev → localhost; prod → live host)
 * 3. `DEFAULT_PRODUCTION_ORIGIN` (SSR/build-time only)
 */
const DEFAULT_PRODUCTION_ORIGIN = "https://harit-infield.serenticaglobal.com";

/** Old deployments; if still present in `.env.local`, we ignore and use fallbacks above. */
const LEGACY_PORTAL_ORIGINS = new Set([
  "https://verdan-beige.vercel.app",
  "https://verdanapp.vercel.app",
]);

function portalOriginFromEnv(): string | null {
  const raw = import.meta.env.VITE_BASE_URL?.trim();
  if (!raw) return null;
  const normalized = raw.replace(/\/$/, "");
  if (LEGACY_PORTAL_ORIGINS.has(normalized)) return null;
  return normalized;
}

export function getPortalOrigin(): string {
  const fromEnv = portalOriginFromEnv();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_PRODUCTION_ORIGIN;
}

/** Full URL for the public tree page (also the QR code target). */
export function buildPublicTreeDetailUrl(treeId: string): string {
  return `${getPortalOrigin()}/tree/${encodeURIComponent(treeId)}`;
}
