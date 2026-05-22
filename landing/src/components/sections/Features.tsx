"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Users,
  Smartphone,
  FileBarChart,
  RefreshCw,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";

const VERDAN = "#48845c";
const VERDAN_RGB = "72, 132, 92";

function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function BentoCard({
  className,
  children,
  delay = 0,
  inView,
  tone = "light",
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  inView: boolean;
  tone?: "light" | "brand";
}) {
  const surfaces = {
    light:
      "glass-panel-strong !rounded-[8px] text-[var(--color-font)] hover:shadow-[0_24px_60px_-28px_rgba(var(--verdan-green-rgb),0.28)]",
    brand:
      "border border-white/20 text-white !rounded-[8px]",
  } as const;

  return (
    <div
      className={cn(
        "group relative overflow-hidden transition-all duration-700",
        "hover:-translate-y-1",
        surfaces[tone],
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      style={{
        transitionDelay: `${delay}ms`,
        ...(tone === "brand"
          ? {
              background: `linear-gradient(140deg, ${VERDAN} 0%, #2e6b44 100%)`,
              boxShadow: `0 30px 80px -30px rgba(${VERDAN_RGB},0.45)`,
            }
          : {}),
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px 260px at var(--mx,50%) var(--my,0%), rgba(${VERDAN_RGB},0.12), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

function CardHead({
  eyebrow,
  title,
  desc,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  desc: string;
  light?: boolean;
}) {
  return (
    <div className={cn("p-6 md:p-7", light ? "text-white" : "")}>
      {eyebrow && (
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.2em]",
            light ? "text-white/65" : "text-[var(--color-font)]/45",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h3 className="mt-2 text-xl font-normal leading-snug tracking-tight md:text-2xl">
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 text-[15px] font-light leading-relaxed",
          light ? "text-white/75" : "text-[var(--color-font)]/70",
        )}
      >
        {desc}
      </p>
    </div>
  );
}

function DashboardViz() {
  return (
    <div className="relative h-56 w-full overflow-hidden md:h-64">
      <svg viewBox="0 0 480 240" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="featGArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={VERDAN} stopOpacity="0.45" />
            <stop offset="100%" stopColor={VERDAN} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="featGGrid" x1="0" x2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="24"
            x2="456"
            y1={50 + i * 40}
            y2={50 + i * 40}
            stroke="url(#featGGrid)"
            strokeDasharray="2 6"
          />
        ))}
        <path
          d="M24,170 L80,140 L130,150 L180,110 L235,120 L290,80 L345,95 L400,55 L456,70 L456,210 L24,210 Z"
          fill="url(#featGArea)"
        >
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M24,170 L80,140 L130,150 L180,110 L235,120 L290,80 L345,95 L400,55 L456,70 L456,210 L24,210 Z;
              M24,160 L80,150 L130,120 L180,135 L235,95 L290,110 L345,70 L400,85 L456,55 L456,210 L24,210 Z;
              M24,170 L80,140 L130,150 L180,110 L235,120 L290,80 L345,95 L400,55 L456,70 L456,210 L24,210 Z"
          />
        </path>
        <path
          d="M24,170 L80,140 L130,150 L180,110 L235,120 L290,80 L345,95 L400,55 L456,70"
          fill="none"
          stroke={VERDAN}
          strokeWidth="2"
        >
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M24,170 L80,140 L130,150 L180,110 L235,120 L290,80 L345,95 L400,55 L456,70;
              M24,160 L80,150 L130,120 L180,135 L235,95 L290,110 L345,70 L400,85 L456,55;
              M24,170 L80,140 L130,150 L180,110 L235,120 L290,80 L345,95 L400,55 L456,70"
          />
        </path>
        {[60, 120, 180, 240, 300, 360, 420].map((x, i) => (
          <rect
            key={x}
            x={x - 6}
            y={200}
            width="6"
            height="12"
            rx="2"
            fill={VERDAN}
            opacity="0.25"
          >
            <animate
              attributeName="height"
              values="12;28;14;22;12"
              dur={`${3 + (i % 3)}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="200;184;198;190;200"
              dur={`${3 + (i % 3)}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
        <g transform="translate(400,55)">
          <circle r="5" fill={VERDAN} />
          <circle r="5" fill={VERDAN} opacity="0.5">
            <animate
              attributeName="r"
              values="5;14;5"
              dur="2.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
      <div className="absolute left-5 top-4 flex gap-2">
        <span className="rounded-full border border-white/50 bg-white/70 px-2.5 py-1 text-[10px] font-medium text-[var(--color-font)]/70 backdrop-blur">
          12,486 trees
        </span>
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] font-medium backdrop-blur"
          style={{
            borderColor: `rgba(${VERDAN_RGB},0.3)`,
            background: `rgba(${VERDAN_RGB},0.12)`,
            color: VERDAN,
          }}
        >
          <span
            className="mr-1 inline-block h-1.5 w-1.5 -translate-y-px rounded-full align-middle"
            style={{ background: VERDAN }}
          />
          live
        </span>
      </div>
    </div>
  );
}

function MapViz() {
  const pins = [
    { x: 70, y: 80 },
    { x: 160, y: 130 },
    { x: 230, y: 60 },
    { x: 320, y: 150 },
    { x: 380, y: 90 },
    { x: 110, y: 170 },
  ];
  return (
    <div className="relative h-56 w-full overflow-hidden md:h-64">
      <svg viewBox="0 0 440 240" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern
            id="featDotgrid"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="rgba(0,0,0,0.08)" />
          </pattern>
          <radialGradient id="featMapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={VERDAN} stopOpacity="0.35" />
            <stop offset="100%" stopColor={VERDAN} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="440" height="240" fill="url(#featDotgrid)" />
        <ellipse cx="220" cy="130" rx="220" ry="110" fill="url(#featMapGlow)" />
        <path
          d="M40,170 C90,120 150,150 200,120 C260,85 320,150 400,110 L400,240 L40,240 Z"
          fill={`rgba(${VERDAN_RGB},0.08)`}
          stroke={`rgba(${VERDAN_RGB},0.22)`}
        />
        <path
          d="M30,90 C80,70 140,95 200,75 C270,55 340,80 410,55"
          fill="none"
          stroke={`rgba(${VERDAN_RGB},0.18)`}
          strokeDasharray="3 5"
        />
        <path
          d="M70,80 Q150,30 230,60 T380,90"
          fill="none"
          stroke={VERDAN}
          strokeOpacity="0.7"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-40"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        {pins.map((p, i) => (
          <g key={i} transform={`translate(${p.x},${p.y})`}>
            <circle r="4" fill={VERDAN} />
            <circle r="4" fill={VERDAN}>
              <animate
                attributeName="r"
                values="4;18;4"
                dur="2.6s"
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0;0.7"
                dur="2.6s"
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
      <div className="absolute right-4 top-4 rounded-lg border border-black/10 bg-white/70 px-2.5 py-1.5 text-[10px] font-medium text-[var(--color-font)]/70 backdrop-blur">
        24.587° N · 73.713° E
      </div>
    </div>
  );
}

function PhotoViz() {
  return (
    <div className="relative h-44 w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute h-28 w-44 rounded-xl border border-white/60 bg-white/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] transition-transform duration-700 group-hover:rotate-0"
            style={{
              transform: `translateX(${(i - 1) * 28}px) rotate(${(i - 1) * 6}deg)`,
              zIndex: i,
              background: "linear-gradient(135deg, #eef3ea, #dce8d4)",
            }}
          >
            <div className="flex h-full w-full flex-col justify-between p-2">
              <svg viewBox="0 0 40 40" className="h-10 w-10 self-center">
                <path
                  d="M20 6 L28 22 L23 22 L29 32 L11 32 L17 22 L12 22 Z"
                  fill={VERDAN}
                />
                <rect x="18" y="32" width="4" height="5" fill="#7a5a3a" />
              </svg>
              <div className="flex items-center justify-between text-[9px] text-[var(--color-font)]/55">
                <span>SITE-{i + 12}</span>
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white"
                  style={{ background: VERDAN }}
                >
                  ✓
                </span>
              </div>
            </div>
          </div>
        ))}
        <svg viewBox="0 0 60 60" className="absolute -right-2 -top-2 h-12 w-12">
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="white"
            stroke={VERDAN}
            strokeWidth="2"
          />
          <path
            d="M18 30 L27 39 L43 22"
            fill="none"
            stroke={VERDAN}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset="40"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="40;0;0;40"
              keyTimes="0;0.4;0.8;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>
  );
}

function GrowthViz() {
  return (
    <div className="relative h-44 w-full overflow-hidden">
      <svg viewBox="0 0 220 160" className="absolute inset-0 h-full w-full">
        <line
          x1="10"
          x2="210"
          y1="140"
          y2="140"
          stroke="rgba(0,0,0,0.12)"
          strokeDasharray="3 5"
        />
        <rect x="105" y="100" width="10" height="40" rx="2" fill="#7a5a3a">
          <animate
            attributeName="y"
            values="130;100;100;130"
            dur="6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="height"
            values="10;40;40;10"
            dur="6s"
            repeatCount="indefinite"
          />
        </rect>
        {[
          { y: 88, r: 22, d: 0 },
          { y: 70, r: 28, d: 0.2 },
          { y: 54, r: 22, d: 0.4 },
        ].map((c, i) => (
          <circle
            key={i}
            cx="110"
            cy={c.y}
            r={c.r}
            fill={VERDAN}
            opacity="0.85"
          >
            <animate
              attributeName="r"
              values={`0;${c.r};${c.r};0`}
              keyTimes="0;0.4;0.85;1"
              dur="6s"
              repeatCount="indefinite"
              begin={`${c.d}s`}
            />
          </circle>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <text
            key={i}
            x="190"
            y={130 - i * 28}
            fontSize="9"
            fill="rgba(0,0,0,0.4)"
            textAnchor="end"
          >
            {["Y0", "Y1", "Y2", "Y3"][i]}
          </text>
        ))}
      </svg>
    </div>
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
          <linearGradient id="featSky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#dfeadf" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#dfeadf" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="featHill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9fc7a8" stopOpacity="0.9" />
            <stop offset="100%" stopColor={VERDAN} stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="600" height="240" fill="url(#featSky)" />
        <path
          d="M0,180 C100,150 180,170 280,150 C380,130 460,160 600,140 L600,240 L0,240 Z"
          fill="rgba(255,255,255,0.18)"
        />
        <path
          d="M0,210 C120,180 220,200 330,180 C440,160 520,200 600,180 L600,240 L0,240 Z"
          fill="url(#featHill)"
        />
        {Array.from({ length: 18 }).map((_, i) => {
          const x = 30 + i * 32;
          const y = 200 - (i % 3) * 6;
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <path d="M0,0 L6,-14 L-6,-14 Z" fill="#2e6b44" opacity="0">
                <animate
                  attributeName="opacity"
                  values="0;1;1"
                  keyTimes="0;0.6;1"
                  dur="5s"
                  begin={`${i * 0.12}s`}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="0.2;1;1"
                  keyTimes="0;0.6;1"
                  dur="5s"
                  begin={`${i * 0.12}s`}
                  repeatCount="indefinite"
                  additive="sum"
                />
              </path>
            </g>
          );
        })}
        <circle cx="510" cy="60" r="18" fill="white" opacity="0.6" />
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

function SitesViz() {
  return (
    <div className="relative h-24 w-full">
      <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full">
        {[
          { x: 30, y: 40, d: 0 },
          { x: 80, y: 25, d: 0.4 },
          { x: 130, y: 50, d: 0.8 },
          { x: 175, y: 30, d: 1.2 },
        ].map((p, i) => (
          <g key={i} transform={`translate(${p.x},${p.y})`}>
            <circle r="3" fill={VERDAN} />
            <circle r="3" fill={VERDAN} opacity="0.5">
              <animate
                attributeName="r"
                values="3;10;3"
                dur="2.4s"
                begin={`${p.d}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0;0.6"
                dur="2.4s"
                begin={`${p.d}s`}
                repeatCount="indefinite"
              />
            </circle>
            <path
              d={`M0,-4 L0,-${10 + i * 2}`}
              stroke={VERDAN}
              strokeOpacity="0.3"
              strokeDasharray="2 3"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function TeamViz() {
  const nodes = [
    { x: 100, y: 40, lead: true },
    { x: 40, y: 18 },
    { x: 40, y: 62 },
    { x: 160, y: 18 },
    { x: 160, y: 62 },
  ];
  return (
    <div className="relative h-24 w-full">
      <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full">
        {nodes.slice(1).map((n, i) => (
          <line
            key={i}
            x1="100"
            y1="40"
            x2={n.x}
            y2={n.y}
            stroke={VERDAN}
            strokeOpacity="0.35"
            strokeDasharray="3 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-14"
              dur="3s"
              repeatCount="indefinite"
            />
          </line>
        ))}
        {nodes.map((n, i) => (
          <g key={i} transform={`translate(${n.x},${n.y})`}>
            <circle
              r={n.lead ? 11 : 8}
              fill="white"
              stroke={VERDAN}
              strokeWidth={n.lead ? 2 : 1.4}
            />
            <circle cy="-2" r={n.lead ? 3 : 2.4} fill={VERDAN} />
            <rect
              x={n.lead ? -6 : -5}
              y="1"
              width={n.lead ? 12 : 10}
              height={n.lead ? 6 : 5}
              rx="3"
              fill={VERDAN}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function DeviceViz() {
  return (
    <div className="relative h-24 w-full">
      <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full">
        <rect
          x="20"
          y="14"
          width="90"
          height="52"
          rx="6"
          fill="none"
          stroke={VERDAN}
          strokeWidth="1.5"
        />
        <rect
          x="26"
          y="20"
          width="78"
          height="38"
          rx="3"
          fill={`rgba(${VERDAN_RGB},0.10)`}
        />
        <line x1="14" x2="116" y1="68" y2="68" stroke={VERDAN} strokeWidth="1.5" />
        <rect
          x="120"
          y="22"
          width="34"
          height="44"
          rx="4"
          fill="none"
          stroke={VERDAN}
          strokeWidth="1.5"
        />
        <rect
          x="124"
          y="26"
          width="26"
          height="32"
          rx="2"
          fill={`rgba(${VERDAN_RGB},0.10)`}
        />
        <rect
          x="162"
          y="28"
          width="22"
          height="38"
          rx="4"
          fill="none"
          stroke={VERDAN}
          strokeWidth="1.5"
        />
        <rect
          x="165"
          y="32"
          width="16"
          height="26"
          rx="1.5"
          fill={`rgba(${VERDAN_RGB},0.10)`}
        />
        <circle r="3" fill={VERDAN}>
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path="M30,40 H150 H170"
          />
        </circle>
      </svg>
    </div>
  );
}

function ReportsViz() {
  return (
    <div className="relative h-44 w-full overflow-hidden">
      <svg viewBox="0 0 320 160" className="absolute inset-0 h-full w-full">
        <g>
          <rect
            x="30"
            y="30"
            width="80"
            height="100"
            rx="8"
            fill="white"
            stroke="rgba(0,0,0,0.1)"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="42"
              y={48 + i * 14}
              width={i % 2 ? 40 : 56}
              height="4"
              rx="2"
              fill="rgba(0,0,0,0.12)"
            />
          ))}
        </g>
        <g stroke={VERDAN} strokeWidth="2" fill="none">
          <line x1="120" y1="80" x2="170" y2="80" strokeDasharray="4 6">
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-20"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
          <path d="M165,74 L173,80 L165,86" />
        </g>
        <g transform="translate(190,30)">
          <rect
            width="110"
            height="100"
            rx="10"
            fill="white"
            stroke="rgba(0,0,0,0.08)"
          />
          {[
            { x: 14, h: 30 },
            { x: 34, h: 54 },
            { x: 54, h: 42 },
            { x: 74, h: 70 },
            { x: 94, h: 58 },
          ].map((b, i) => (
            <rect key={i} x={b.x} y={86} width="10" height="0" rx="2" fill={VERDAN}>
              <animate
                attributeName="height"
                values={`0;${b.h};${b.h};0`}
                keyTimes="0;0.4;0.85;1"
                dur="5s"
                begin={`${i * 0.15}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y"
                values={`86;${86 - b.h};${86 - b.h};86`}
                keyTimes="0;0.4;0.85;1"
                dur="5s"
                begin={`${i * 0.15}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}
        </g>
      </svg>
    </div>
  );
}

function SyncViz() {
  return (
    <div className="relative h-24 w-full">
      <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full">
        <rect
          x="20"
          y="22"
          width="44"
          height="36"
          rx="4"
          fill="none"
          stroke={VERDAN}
          strokeWidth="1.5"
        />
        <rect
          x="136"
          y="22"
          width="44"
          height="36"
          rx="4"
          fill="none"
          stroke={VERDAN}
          strokeWidth="1.5"
        />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${68 + i * 18},40 Q${78 + i * 18},${30 - i * 2} ${88 + i * 18},40`}
            fill="none"
            stroke={VERDAN}
            strokeWidth="1.5"
            strokeOpacity={0.6 - i * 0.15}
          >
            <animate
              attributeName="stroke-opacity"
              values={`${0.2};${0.7};${0.2}`}
              dur="1.8s"
              begin={`${i * 0.2}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}
        <circle r="2.5" fill={VERDAN}>
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path="M64,40 H136"
          />
        </circle>
        <circle r="2.5" fill={VERDAN} opacity="0.6">
          <animateMotion
            dur="2.4s"
            begin="1.2s"
            repeatCount="indefinite"
            path="M136,40 H64"
          />
        </circle>
      </svg>
    </div>
  );
}

function SmallFeatureCard({
  icon: Icon,
  eyebrow,
  title,
  desc,
  viz,
  delay,
  inView,
  className,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  eyebrow: string;
  title: string;
  desc: string;
  viz: React.ReactNode;
  delay: number;
  inView: boolean;
  className?: string;
}) {
  return (
    <BentoCard inView={inView} delay={delay} className={cn("h-full", className)}>
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: "var(--verdan-green)" }} />
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45">
            {eyebrow}
          </p>
        </div>
        <h3 className="mt-2 text-xl font-normal tracking-tight">{title}</h3>
        <p className="mt-2 text-[15px] font-light text-[var(--color-font)]/70">
          {desc}
        </p>
      </div>
      {viz}
    </BentoCard>
  );
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const [headVisible, setHeadVisible] = useState(false);
  const { ref: gridRef, inView: gridIn } = useInView<HTMLDivElement>(0.05);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setHeadVisible(true),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", `${e.clientX - r.left}px`);
    t.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      className="section-noise relative w-full overflow-hidden px-6 py-32 md:px-12 lg:px-20"
      style={{ background: "var(--background)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(900px 500px at 88% 6%, rgba(${VERDAN_RGB},0.08), transparent 60%),
                            radial-gradient(700px 420px at 8% 92%, rgba(${VERDAN_RGB},0.05), transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div
          className={cn(
            "max-w-3xl transition-all duration-700",
            headVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <PageHeadline
            line1="Everything needed to monitor"
            line2="modern plantations."
            className={cn(headVisible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg font-light leading-relaxed text-[var(--color-font)]/70",
              headVisible && "hero-animate-fade-slide-up-sm",
            )}
          >
            Built for administrators, field teams, and large-scale environmental
            operations: one system for every tree, every site, every report.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6 md:items-stretch"
        >
          {/* Row 1: dashboard (4) + map start (2, spans 2 rows) */}
          <div
            onMouseMove={onMove}
            className="md:col-start-1 md:col-span-4 md:row-start-1 h-full"
          >
            <BentoCard inView={gridIn} delay={0} className="h-full">
              <CardHead
                eyebrow="Command center"
                title="Real-time plantation dashboard"
                desc="Monitor all plantation activities, growth updates, and team operations from one centralized view."
              />
              <DashboardViz />
            </BentoCard>
          </div>

          <div
            onMouseMove={onMove}
            className="md:col-start-5 md:col-span-2 md:row-start-1 md:row-span-2 h-full"
          >
            <BentoCard inView={gridIn} delay={80} className="h-full">
              <CardHead
                eyebrow="Geospatial"
                title="GPS-based tree tracking"
                desc="Every planted tree is mapped with precise coordinates and live location records."
              />
              <MapViz />
              <div className="flex items-center gap-2 px-6 pb-6 text-[11px] font-light text-[var(--color-font)]/55 md:px-7">
                <MapPin
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--verdan-green)" }}
                />
                <span>2,418 sites mapped this month</span>
              </div>
            </BentoCard>
          </div>

          {/* Row 2: photo + growth (under dashboard) */}
          <div
            onMouseMove={onMove}
            className="md:col-start-1 md:col-span-2 md:row-start-2 h-full"
          >
            <BentoCard inView={gridIn} delay={160} className="h-full">
              <CardHead
                eyebrow="Verification"
                title="Photo verification system"
                desc="Timestamped tree photos flow into clean approval workflows."
              />
              <PhotoViz />
            </BentoCard>
          </div>

          <div
            onMouseMove={onMove}
            className="md:col-start-3 md:col-span-2 md:row-start-2 h-full"
          >
            <BentoCard inView={gridIn} delay={240} className="h-full">
              <CardHead
                eyebrow="Analytics"
                title="Growth monitoring"
                desc="Track survival and growth from sapling to mature canopy."
              />
              <GrowthViz />
            </BentoCard>
          </div>

          {/* Row 3: sites + teams + mobile (beside map) */}
          <div
            onMouseMove={onMove}
            className="md:col-start-1 md:col-span-2 md:row-start-3 h-full"
          >
            <SmallFeatureCard
              icon={Layers}
              eyebrow="Sites"
              title="Site management"
              desc="Manage multiple plantation locations efficiently."
              viz={<SitesViz />}
              delay={320}
              inView={gridIn}
              className="h-full"
            />
          </div>

          <div
            onMouseMove={onMove}
            className="md:col-start-3 md:col-span-2 md:row-start-3 h-full"
          >
            <SmallFeatureCard
              icon={Users}
              eyebrow="Teams"
              title="Team administration"
              desc="Assign field teams to specific plantation sites."
              viz={<TeamViz />}
              delay={400}
              inView={gridIn}
              className="h-full"
            />
          </div>

          <div
            onMouseMove={onMove}
            className="md:col-start-5 md:col-span-2 md:row-start-3 h-full"
          >
            <SmallFeatureCard
              icon={Smartphone}
              eyebrow="Anywhere"
              title="Mobile friendly"
              desc="Built for field teams on any device."
              viz={<DeviceViz />}
              delay={480}
              inView={gridIn}
              className="h-full"
            />
          </div>

          {/* Row 4: reports + sync */}
          <div
            onMouseMove={onMove}
            className="md:col-start-1 md:col-span-3 md:row-start-4 h-full"
          >
            <BentoCard inView={gridIn} delay={560} className="h-full">
              <CardHead
                eyebrow="Reporting"
                title="Data export & reports"
                desc="Turn plantation records into shareable analytics, instantly."
              />
              <ReportsViz />
              <div className="flex items-center gap-2 px-6 pb-6 text-[11px] font-light text-[var(--color-font)]/55 md:px-7">
                <FileBarChart
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--verdan-green)" }}
                />
                <span>CSV · XLSX · PDF · API</span>
              </div>
            </BentoCard>
          </div>

          <div
            onMouseMove={onMove}
            className="md:col-start-4 md:col-span-3 md:row-start-4 h-full"
          >
            <SmallFeatureCard
              icon={RefreshCw}
              eyebrow="Sync"
              title="Real-time sync"
              desc="Instant updates across every device."
              viz={<SyncViz />}
              delay={640}
              inView={gridIn}
              className="h-full"
            />
          </div>

          {/* Row 5: brand banner */}
          <div
            onMouseMove={onMove}
            className="md:col-start-1 md:col-span-6 md:row-start-5 h-full"
          >
            <BentoCard inView={gridIn} delay={720} tone="brand">
              <div className="grid items-center gap-6 md:grid-cols-12">
                <div className="p-7 md:col-span-5 md:p-9">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
                    The bigger picture
                  </p>
                  <h3 className="mt-3 text-2xl font-normal leading-tight tracking-tight md:text-4xl">
                    Built for environmental accountability.
                  </h3>
                  <p className="mt-4 max-w-md text-[15px] font-light leading-relaxed text-white/80">
                    Verdan transforms tree plantation from a one-time activity
                    into measurable environmental infrastructure.
                  </p>
                </div>
                <div className="md:col-span-7">
                  <LandscapeViz />
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
