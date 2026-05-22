"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users,
  Smartphone,
  FileBarChart,
  RefreshCw,
  Layers,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";
import HeroDashboard from "@/components/HeroDashboard";
import { DASHBOARD_TREE_AVATARS } from "@/components/dashboardTreeAvatars";
import { Globe } from "@/components/ui/Globe";

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
  className,
}: {
  eyebrow?: string;
  title: string;
  desc: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("p-6 md:p-7", light ? "text-white" : "", className)}>
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
    <div className="feature-dashboard-viz w-full px-4 pt-4">
      <div className="relative max-h-[280px] overflow-hidden sm:max-h-[320px] md:max-h-[360px]">
        <HeroDashboard variant="feature" />
        <div
          aria-hidden
          className="feature-dashboard-viz-fade pointer-events-none absolute inset-x-0 bottom-0 z-10"
        />
      </div>
    </div>
  );
}

function GlobeViz() {
  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden px-4 pb-4 pt-6 md:pt-8">
      <Globe className="max-w-[min(100%,260px)]" />
    </div>
  );
}

const PHOTO_CARD_LABELS = [
  "IMG 1.0",
  "IMG 1.1",
  "IMG 1.2",
  "IMG 1.3",
  "IMG 1.4",
] as const;

const PHOTO_CARD_SIZE = 216;
const PHOTO_STACK_STEP = 44;
const PHOTO_STACK_SHADOW_PAD = 32;

function PhotoViz() {
  const stackWidth =
    PHOTO_CARD_SIZE + (PHOTO_CARD_LABELS.length - 1) * PHOTO_STACK_STEP;
  const frontIndex = PHOTO_CARD_LABELS.length - 1;

  return (
    <div className="relative flex w-full justify-center overflow-visible px-4 pb-5 pt-8 md:pt-10">
      <div
        className="relative shrink-0 overflow-visible"
        style={{
          width: stackWidth,
          height: PHOTO_CARD_SIZE + PHOTO_STACK_SHADOW_PAD,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-[4%] z-0 h-14 w-[96%] rounded-[50%] bg-black/[0.09] blur-2xl"
        />
        {PHOTO_CARD_LABELS.map((label, i) => {
          const Avatar = DASHBOARD_TREE_AVATARS[i];
          const isFront = i === frontIndex;
          return (
            <div
              key={label}
              className={cn(
                "absolute top-0 rounded-[8px] border border-gray-200/90 bg-white transition-transform duration-700 group-hover:rotate-0",
                isFront
                  ? "overflow-visible shadow-[0_10px_28px_-8px_rgba(0,0,0,0.2)]"
                  : "overflow-hidden shadow-[0_4px_14px_-6px_rgba(0,0,0,0.12)]",
              )}
              style={{
                left: i * PHOTO_STACK_STEP,
                width: PHOTO_CARD_SIZE,
                height: PHOTO_CARD_SIZE,
                zIndex: i + 1,
                transform: `rotate(${(i - 2) * 2.5}deg)`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[8px]"
                style={{
                  background: `radial-gradient(circle at 100% 100%, rgba(${VERDAN_RGB}, 0.34) 0%, rgba(${VERDAN_RGB}, 0.12) 18%, transparent 38%)`,
                }}
              />
              <span className="absolute left-2.5 top-2.5 z-10 text-[10px] font-medium tracking-tight text-gray-500">
                {label}
              </span>
              {isFront && (
                <div className="relative flex h-full w-full items-center justify-center px-3 pt-5">
                  <div className="h-[6rem] w-[6rem] shrink-0 overflow-hidden rounded-[8px] ring-1 ring-gray-200">
                    <Avatar className="h-full w-full" aria-hidden />
                  </div>
                </div>
              )}
              <span
                className="absolute bottom-2 right-2 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full text-white shadow-[0_2px_8px_-2px_rgba(72,132,92,0.55)]"
                style={{ background: VERDAN }}
                aria-hidden
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              </span>
            </div>
          );
        })}
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

      <div className="relative z-10 mx-auto max-w-7xl">
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
          className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch"
        >
          {/* Full width: plantation dashboard */}
          <div onMouseMove={onMove} className="md:col-span-2">
            <BentoCard inView={gridIn} delay={0} className="flex h-full flex-col">
              <DashboardViz />
              <div className="mt-auto">
                <CardHead
                  title="Real-time plantation dashboard"
                  desc="Monitor all plantation activities, growth updates, and team operations from one centralized view."
                />
              </div>
            </BentoCard>
          </div>

          {/* GPS + photo verification */}
          <div onMouseMove={onMove} className="h-full">
            <BentoCard inView={gridIn} delay={80} className="flex h-full flex-col">
              <GlobeViz />
              <div className="mt-auto">
                <CardHead
                  title="GPS-based tree tracking"
                  desc="Every planted tree is mapped with precise coordinates and live location records."
                  className="!pt-2 md:!pt-3"
                />
              </div>
            </BentoCard>
          </div>

          <div onMouseMove={onMove} className="h-full">
            <BentoCard
              inView={gridIn}
              delay={160}
              className="flex h-full flex-col overflow-visible"
            >
              <PhotoViz />
              <div className="mt-auto">
                <CardHead
                  title="Photo verification system"
                  desc="Timestamped tree photos flow into clean approval workflows."
                  className="!pt-2 md:!pt-3"
                />
              </div>
            </BentoCard>
          </div>

          {/* Growth + data export */}
          <div onMouseMove={onMove} className="h-full">
            <BentoCard inView={gridIn} delay={240} className="h-full">
              <CardHead
                eyebrow="Analytics"
                title="Growth monitoring"
                desc="Track survival and growth from sapling to mature canopy."
              />
              <GrowthViz />
            </BentoCard>
          </div>

          <div onMouseMove={onMove} className="h-full">
            <BentoCard inView={gridIn} delay={320} className="h-full">
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

          {/* Site management + team administration */}
          <div onMouseMove={onMove} className="h-full">
            <SmallFeatureCard
              icon={Layers}
              eyebrow="Sites"
              title="Site management"
              desc="Manage multiple plantation locations efficiently."
              viz={<SitesViz />}
              delay={400}
              inView={gridIn}
              className="h-full"
            />
          </div>

          <div onMouseMove={onMove} className="h-full">
            <SmallFeatureCard
              icon={Users}
              eyebrow="Teams"
              title="Team administration"
              desc="Assign field teams to specific plantation sites."
              viz={<TeamViz />}
              delay={480}
              inView={gridIn}
              className="h-full"
            />
          </div>

          {/* Mobile friendly + real-time sync */}
          <div onMouseMove={onMove} className="h-full">
            <SmallFeatureCard
              icon={Smartphone}
              eyebrow="Anywhere"
              title="Mobile friendly"
              desc="Built for field teams on any device."
              viz={<DeviceViz />}
              delay={560}
              inView={gridIn}
              className="h-full"
            />
          </div>

          <div onMouseMove={onMove} className="h-full">
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

          {/* Full width: environmental accountability */}
          <div onMouseMove={onMove} className="md:col-span-2">
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
