import Link from "next/link";
import { cn } from "@/lib/utils";

export const beginNowCtaClassName =
  "begin-now-cta group flex items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-[8px] border border-[rgb(74,137,92)]/35 bg-white/15 text-sm font-normal uppercase leading-none tracking-wide text-black shadow-[0_2px_6px_rgba(0,0,0,0.11)] backdrop-blur-md outline-none transition-[border-color] duration-[320ms] ease-in-out hover:border-[#48845c] focus-visible:ring-2 focus-visible:ring-[#48845c]/45";

const BEGIN_NOW_HREF = "https://verdan-beige.vercel.app/";

function BeginNowArrow() {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        "begin-now-cta__arrow h-[0.85em] w-[0.85em] shrink-0",
        "[&_path:first-child]:opacity-0",
        "[&_path:first-child]:transition-opacity [&_path:first-child]:duration-300 [&_path:first-child]:ease-[cubic-bezier(0.25,1,0.5,1)]",
        "[&_path:last-child]:transition-transform [&_path:last-child]:duration-300 [&_path:last-child]:ease-[cubic-bezier(0.25,1,0.5,1)]",
        "group-hover:[&_path:first-child]:opacity-100 group-focus-visible:[&_path:first-child]:opacity-100",
        "group-hover:[&_path:last-child]:translate-x-[3px] group-focus-visible:[&_path:last-child]:translate-x-[3px]"
      )}
    >
      <path d="M0.5 5.5h7" />
      <path d="M1.5 1.5l4 4-4 4" />
    </svg>
  );
}

export function BeginNowButton({
  className,
  onClick,
  label = "Begin Now",
}: {
  className?: string;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <Link
      href={BEGIN_NOW_HREF}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(beginNowCtaClassName, "px-5 py-3", className)}
      style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
    >
      <span className="begin-now-cta__label">{label}</span>
      <BeginNowArrow />
    </Link>
  );
}
