"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { typeBodyOnDark, typeCallout, typeEyebrowLight } from "@/lib/typography";

const VERDAN = "#48845c";
const VERDAN_RGB = "72, 132, 92";

const LANDSCAPE_BEFORE_TREES = [
  { x: 78, y: 202 },
  { x: 158, y: 198 },
  { x: 238, y: 205 },
] as const;

const LANDSCAPE_AFTER_TREES: { x: number; y: number; scale: number }[] = [
  { x: 358, y: 172, scale: 0.82 },
  { x: 412, y: 166, scale: 0.88 },
  { x: 468, y: 170, scale: 0.8 },
  { x: 522, y: 164, scale: 0.86 },
  { x: 562, y: 168, scale: 0.84 },
  { x: 348, y: 188, scale: 0.9 },
  { x: 398, y: 184, scale: 0.78 },
  { x: 448, y: 190, scale: 0.86 },
  { x: 498, y: 186, scale: 0.8 },
  { x: 548, y: 192, scale: 0.85 },
  { x: 368, y: 206, scale: 0.95 },
  { x: 428, y: 202, scale: 0.88 },
  { x: 488, y: 208, scale: 0.92 },
  { x: 538, y: 204, scale: 0.9 },
  { x: 458, y: 214, scale: 0.86 },
];

function LandscapeTree({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  const h = 16 * scale;
  const w = 7 * scale;
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={`M0,0 L${w},${-h} L${-w},${-h} Z`} fill="#2e6b44" opacity={0.9} />
      <rect
        x={-1.2 * scale}
        y={-2}
        width={2.4 * scale}
        height={3 * scale}
        fill="#3d5c45"
        rx={0.5}
      />
    </g>
  );
}

function LandscapeViz() {
  return (
    <div className="relative h-56 w-full overflow-hidden md:h-72">
      <svg
        viewBox="0 0 600 240"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="proofLandscapeSky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#dfeadf" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#dfeadf" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="proofLandscapeHill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9fc7a8" stopOpacity="0.9" />
            <stop offset="100%" stopColor={VERDAN} stopOpacity="1" />
          </linearGradient>
          <clipPath id="proofLandscapeBeforeClip">
            <rect x="0" y="0" width="300" height="240" />
          </clipPath>
          <clipPath id="proofLandscapeAfterClip">
            <rect x="300" y="0" width="300" height="240" />
          </clipPath>
        </defs>
        <rect width="600" height="240" fill="url(#proofLandscapeSky)" />
        <path
          d="M0,180 C100,150 180,170 280,150 C380,130 460,160 600,140 L600,240 L0,240 Z"
          fill="rgba(255,255,255,0.18)"
        />
        <path
          d="M0,210 C120,180 220,200 330,180 C440,160 520,200 600,180 L600,240 L0,240 Z"
          fill="url(#proofLandscapeHill)"
        />
        <g clipPath="url(#proofLandscapeBeforeClip)">
          {LANDSCAPE_BEFORE_TREES.map((t, i) => (
            <LandscapeTree key={`before-${i}`} x={t.x} y={t.y} scale={1.05} />
          ))}
        </g>
        <g clipPath="url(#proofLandscapeAfterClip)">
          {LANDSCAPE_AFTER_TREES.map((t, i) => (
            <LandscapeTree
              key={`after-${i}`}
              x={t.x}
              y={t.y}
              scale={t.scale}
            />
          ))}
        </g>
      </svg>
      <div
        className="absolute inset-y-0 left-1/2 w-px"
        style={{ background: "rgba(255,255,255,0.4)" }}
      />
      <span className="absolute left-4 top-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
        before
      </span>
      <span className="absolute right-4 top-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
        after
      </span>
    </div>
  );
}

export default function AccountabilityBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-[8px] border border-white/20 text-white transition-all duration-700",
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
      style={{
        background: `linear-gradient(140deg, ${VERDAN} 0%, #2e6b44 100%)`,
        boxShadow: `0 30px 80px -30px rgba(${VERDAN_RGB}, 0.45)`,
      }}
    >
      <div className="grid items-center gap-6 md:grid-cols-12">
        <div className="p-7 md:col-span-5 md:p-9">
          <p className={typeEyebrowLight}>The bigger picture</p>
          <h3 className={cn("mt-3", typeCallout, "text-white")}>
            Built for environmental accountability.
          </h3>
          <p className={cn("mt-4 max-w-md", typeBodyOnDark)}>
            Harit transforms tree plantation from a one-time activity into
            measurable environmental infrastructure.
          </p>
        </div>
        <div className="md:col-span-7">
          <LandscapeViz />
        </div>
      </div>
    </div>
  );
}
