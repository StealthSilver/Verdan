/** Compact relative label for notification timestamps. */
export function formatRelativeTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const now = Date.now();
  const t = d.getTime();
  if (Number.isNaN(t)) return "";
  const diffSec = Math.floor((now - t) / 1000);
  if (diffSec < 45) return "just now";
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m} min ago`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const yStart = new Date(dayStart);
  yStart.setDate(yStart.getDate() - 1);
  if (t >= yStart.getTime() && t < dayStart.getTime()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}
