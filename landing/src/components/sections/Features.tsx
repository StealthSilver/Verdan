"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, MapPin, Sprout, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";
import HeroDashboard from "@/components/HeroDashboard";
import { DASHBOARD_TREE_AVATARS } from "@/components/dashboardTreeAvatars";
import dynamic from "next/dynamic";

const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  { ssr: false },
);

const GrowthChart = dynamic(
  () => import("@/components/GrowthChart").then((m) => m.GrowthChart),
  { ssr: false },
);

const VERDAN = "#48845c";
const VERDAN_RGB = "72, 132, 92";

function useInView<T extends HTMLElement>(threshold = 0.15, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

const DEVICE_SYNC_FADE_MS = 480;

function useSyncedDisplayPhase(phase: number) {
  const [renderPhase, setRenderPhase] = useState(phase);
  const [contentVisible, setContentVisible] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setContentVisible(false);
    const t = window.setTimeout(() => {
      setRenderPhase(phase);
      requestAnimationFrame(() => setContentVisible(true));
    }, DEVICE_SYNC_FADE_MS);

    return () => window.clearTimeout(t);
  }, [phase]);

  return { renderPhase, contentVisible };
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
    light: "glass-panel-strong !rounded-[8px] text-[var(--color-font)]",
    brand: "border border-white/20 text-white !rounded-[8px]",
  } as const;

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-700",
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
  descClassName,
}: {
  eyebrow?: string;
  title: string;
  desc: string;
  light?: boolean;
  className?: string;
  descClassName?: string;
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
          descClassName,
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
      <Globe className="max-w-[min(100%,300px)]" />
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

const PHOTO_CARD_SIZE = 182;
const PHOTO_STACK_STEP = 34;
const PHOTO_STACK_SHADOW_PAD = 24;

function PhotoViz() {
  const stackWidth =
    PHOTO_CARD_SIZE + (PHOTO_CARD_LABELS.length - 1) * PHOTO_STACK_STEP;
  const frontIndex = PHOTO_CARD_LABELS.length - 1;

  return (
    <div className="relative flex w-full justify-center overflow-visible px-4 pb-4 pt-2 md:px-5 md:pb-5">
      <div
        className="relative shrink-0 overflow-visible"
        style={{
          width: stackWidth,
          height: PHOTO_CARD_SIZE + PHOTO_STACK_SHADOW_PAD,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-[4%] z-0 h-10 w-[96%] rounded-[50%] bg-black/[0.09] blur-2xl"
        />
        {PHOTO_CARD_LABELS.map((label, i) => {
          const Avatar = DASHBOARD_TREE_AVATARS[i];
          const isFront = i === frontIndex;
          return (
            <div
              key={label}
              className={cn(
                "absolute top-0 rounded-[8px] border border-gray-200/90 bg-[var(--background)] transition-transform duration-700 group-hover:rotate-0",
                isFront
                  ? "overflow-visible shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]"
                  : "overflow-hidden shadow-[0_6px_20px_-6px_rgba(0,0,0,0.14)]",
              )}
              style={{
                left: i * PHOTO_STACK_STEP,
                width: PHOTO_CARD_SIZE,
                height: PHOTO_CARD_SIZE,
                zIndex: i + 1,
                transform: `rotate(${(i - 2) * 2.5}deg)`,
              }}
            >
              <span className="absolute left-2 top-2 z-10 text-[9px] font-medium tracking-tight text-gray-500">
                {label}
              </span>
              {isFront && (
                <div className="relative flex h-full w-full items-center justify-center px-2 pt-3.5">
                  <div className="h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden rounded-[8px] bg-[var(--background)] ring-1 ring-gray-200">
                    <Avatar className="h-full w-full" aria-hidden />
                  </div>
                </div>
              )}
              <span
                className="absolute bottom-1.5 right-1.5 z-20 inline-flex h-5 w-5 items-center justify-center rounded-full text-white shadow-[0_2px_8px_-2px_rgba(72,132,92,0.55)]"
                style={{ background: VERDAN }}
                aria-hidden
              >
                <Check className="h-3 w-3 stroke-[2.5]" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GrowthViz() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  return (
    <div
      ref={ref}
      className="flex w-full flex-col items-center px-6 pb-4 pt-6 md:px-8 md:pt-8"
    >
      <p className="mb-4 text-center text-[11px] font-light tracking-wide text-[var(--color-font)]/50">
        <span className="font-normal tabular-nums text-[var(--color-font)]/80">
          6 trees
        </span>{" "}
        tracked
        <span className="mx-2 text-[var(--color-font)]/25">·</span>
        Avg height{" "}
        <span className="font-normal tabular-nums text-[var(--color-font)]/80">
          4.3 m
        </span>
      </p>
      <GrowthChart animate={inView} />
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

type IsoCoord = [number, number, number];

/** 2:1 isometric projection — equal x/y/z units form a true cube on screen. */
function isoToScreen(
  [x, y, z]: IsoCoord,
  originX: number,
  originY: number,
  edge: number,
): [number, number] {
  return [
    originX + (x - y) * edge,
    originY + (x + y) * edge * 0.5 - z * edge,
  ];
}

function isoPath(
  points: IsoCoord[],
  originX: number,
  originY: number,
  edge: number,
) {
  return `M ${points
    .map((p) => isoToScreen(p, originX, originY, edge).join(","))
    .join(" L ")} Z`;
}

const SITE_CUBE_EDGE = 48;
const SITE_CUBE_SIZE = 1;
const SITE_CUBE_INSET = 0.24;
const SITE_LAYOUT = {
  centers: [92, 200, 308] as const,
  baseY: 128,
  viewW: 400,
  viewH: 200,
} as const;

const SITE_MGMT_EVENTS = [
  { label: "Site added", Icon: MapPin },
  { label: "Plants recorded", Icon: Sprout },
  { label: "Installation complete", Icon: Wrench },
] as const;

type SiteCubeState = "idle" | "active" | "complete";

function getSiteCubeState(siteIndex: number, phase: number): SiteCubeState {
  if (phase === SITE_MGMT_EVENTS.length - 1) {
    return siteIndex <= phase ? "complete" : "idle";
  }
  if (siteIndex < phase) return "complete";
  if (siteIndex === phase) return "active";
  return "idle";
}

function IsometricSiteCube({
  centerX,
  baseY,
  state,
}: {
  centerX: number;
  baseY: number;
  state: SiteCubeState;
}) {
  const edge = SITE_CUBE_EDGE;
  const s = SITE_CUBE_SIZE;
  const inset = SITE_CUBE_INSET;
  const originX = centerX;
  const originY = baseY - edge / 2;
  const isActive = state === "active";
  const isComplete = state === "complete";

  const stroke = "rgba(14, 14, 14, 0.16)";
  const strokeVerdan = VERDAN;
  const leftFill = isComplete
    ? `rgba(${VERDAN_RGB}, 0.28)`
    : isActive
      ? `rgba(${VERDAN_RGB}, 0.22)`
      : `rgba(${VERDAN_RGB}, 0.12)`;
  const rightFill = isComplete
    ? `rgba(${VERDAN_RGB}, 0.18)`
    : isActive
      ? `rgba(${VERDAN_RGB}, 0.14)`
      : `rgba(${VERDAN_RGB}, 0.07)`;
  const topFill = isComplete
    ? `rgba(${VERDAN_RGB}, 0.14)`
    : isActive
      ? `rgba(${VERDAN_RGB}, 0.08)`
      : "#ffffff";
  const insetFill = isComplete
    ? `rgba(${VERDAN_RGB}, 0.22)`
    : isActive
      ? `rgba(${VERDAN_RGB}, 0.12)`
      : `rgba(${VERDAN_RGB}, 0.05)`;

  const p = (coord: IsoCoord) => isoToScreen(coord, originX, originY, edge);

  const leftFace: IsoCoord[] = [
    [0, 0, 0],
    [0, s, 0],
    [0, s, s],
    [0, 0, s],
  ];
  const rightFace: IsoCoord[] = [
    [0, 0, 0],
    [s, 0, 0],
    [s, 0, s],
    [0, 0, s],
  ];
  const topFace: IsoCoord[] = [
    [0, 0, s],
    [s, 0, s],
    [s, s, s],
    [0, s, s],
  ];
  const topInset: IsoCoord[] = [
    [inset, inset, s],
    [s - inset, inset, s],
    [s - inset, s - inset, s],
    [inset, s - inset, s],
  ];

  const outline: IsoCoord[] = [
    [0, 0, 0],
    [s, 0, 0],
    [s, 0, s],
    [s, s, s],
    [0, s, s],
    [0, s, 0],
  ];

  const leftDashYs = [0.2, 0.4, 0.6, 0.8].map((t) => t * s);
  const rightDashXs = [0.2, 0.4, 0.6, 0.8].map((t) => t * s);

  const [shadowX, shadowY] = p([s / 2, s / 2, 0]);
  const [topCx, topCy] = p([s / 2, s / 2, s]);
  const lineOpacity = isComplete ? 0.55 : isActive ? 0.42 : 0.28;

  return (
    <g>
      <ellipse
        cx={shadowX}
        cy={shadowY + edge * 0.14}
        rx={edge * (isActive || isComplete ? 1.05 : 0.92)}
        ry={edge * (isActive || isComplete ? 0.28 : 0.22)}
        fill={`rgba(${VERDAN_RGB}, ${isComplete ? 0.22 : isActive ? 0.18 : 0.1})`}
      />
      <path
        d={isoPath(leftFace, originX, originY, edge)}
        fill={leftFill}
        stroke="none"
      />
      <path
        d={isoPath(rightFace, originX, originY, edge)}
        fill={rightFill}
        stroke="none"
      />
      <path
        d={isoPath(topFace, originX, originY, edge)}
        fill={topFill}
        stroke="none"
      />
      <path
        d={isoPath(topInset, originX, originY, edge)}
        fill={insetFill}
        stroke="none"
      />
      {isComplete &&
        [0.32, 0.5, 0.68].map((t, i) => {
          const pt = p([t, 0.35 + (i % 2) * 0.2, s + 0.02]);
          return (
            <circle
              key={i}
              cx={pt[0]}
              cy={pt[1]}
              r={2.2}
              fill={VERDAN}
              opacity={0.85}
            />
          );
        })}
      {leftDashYs.map((y, i) => {
        const a = p([0, y, 0]);
        const b = p([0, y, s]);
        return (
          <line
            key={`l-${i}`}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke={strokeVerdan}
            strokeOpacity={lineOpacity}
            strokeWidth={isComplete ? 1.5 : 1.25}
            strokeDasharray={isComplete || isActive ? undefined : "3 4"}
            strokeLinecap="round"
          />
        );
      })}
      {rightDashXs.map((x, i) => {
        const a = p([x, 0, 0]);
        const b = p([x, 0, s]);
        return (
          <line
            key={`r-${i}`}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke={strokeVerdan}
            strokeOpacity={lineOpacity}
            strokeWidth={isComplete ? 1.5 : 1.25}
            strokeDasharray={isComplete || isActive ? undefined : "3 4"}
            strokeLinecap="round"
          />
        );
      })}
      <path
        d={`M ${outline
          .map((c) => p(c).join(","))
          .join(" L ")} Z`}
        fill="none"
        stroke={isComplete ? VERDAN : stroke}
        strokeOpacity={isComplete ? 0.55 : 1}
        strokeWidth={isActive || isComplete ? 2.25 : 2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={isoPath(topInset, originX, originY, edge)}
        fill="none"
        stroke={strokeVerdan}
        strokeOpacity={isComplete ? 0.65 : isActive ? 0.5 : 0.35}
        strokeWidth={isActive || isComplete ? 1.75 : 1.5}
        strokeLinejoin="round"
      />
      <line
        {...{
          x1: p([0, 0, s])[0],
          y1: p([0, 0, s])[1],
          x2: p([s, s, s])[0],
          y2: p([s, s, s])[1],
        }}
        stroke={isComplete ? VERDAN : stroke}
        strokeOpacity={isComplete ? 0.45 : 1}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      {isComplete && (
        <g>
          <circle cx={topCx} cy={topCy - 2} r={7} fill={VERDAN} opacity={0.95} />
          <path
            d={`M ${topCx - 3} ${topCy - 2} L ${topCx - 0.5} ${topCy + 0.5} L ${topCx + 4} ${topCy - 4.5}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.35}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      {isActive && (
        <circle cx={topCx} cy={topCy - 2} r={5} fill="none" stroke={VERDAN} strokeWidth={1.25}>
          <animate
            attributeName="r"
            values="5;8;5"
            dur="1.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.9;0;0.9"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}

function SiteMgmtDrawerStack({ phase }: { phase: number }) {
  return (
    <div className="site-mgmt-drawer-stack" aria-live="polite">
      {SITE_MGMT_EVENTS.map((event, i) => {
        const depth = phase - i;
        if (depth < 0) return null;
        const Icon = event.Icon;
        return (
          <div
            key={event.label}
            className={cn(
              "site-mgmt-drawer",
              depth === 0 && "site-mgmt-drawer--front",
              depth > 0 && "site-mgmt-drawer--behind",
            )}
            style={
              {
                "--drawer-depth": String(depth),
              } as CSSProperties
            }
          >
            <div className="site-mgmt-drawer__card">
              <Icon className="site-mgmt-drawer__icon" strokeWidth={2} aria-hidden />
              <span>{event.label}</span>
            </div>
            {depth === 0 && <span className="site-mgmt-drawer__caret" aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}

function SitesViz() {
  const { ref, inView } = useInView<HTMLDivElement>(0.08, false);
  const [phase, setPhase] = useState(0);
  const { centers, baseY, viewW, viewH } = SITE_LAYOUT;
  const focusIndex = Math.min(phase, centers.length - 1);
  const focusCenterX = centers[focusIndex];

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % SITE_MGMT_EVENTS.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative flex h-full min-h-[16rem] w-full items-center justify-center overflow-visible px-1 py-2 md:min-h-[18rem]"
    >
      <div className="relative w-full max-w-[520px]">
        <div
          className="site-mgmt-drawer-anchor pointer-events-none absolute z-10 flex justify-center"
          style={{
            left: `${(focusCenterX / viewW) * 100}%`,
            top: "4%",
            transform: "translateX(-50%)",
          }}
        >
          <SiteMgmtDrawerStack phase={phase} />
        </div>

        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="h-auto w-full overflow-visible"
          aria-hidden
          preserveAspectRatio="xMidYMid meet"
        >
          {centers.map((centerX, i) => {
            const cubeState = getSiteCubeState(i, phase);
            return (
              <g
                key={centerX}
                className={cn(
                  "feature-site-mgmt-box",
                  cubeState === "active" && "feature-site-mgmt-box--active",
                  cubeState === "complete" && "feature-site-mgmt-box--complete",
                )}
              >
                <IsometricSiteCube
                  centerX={centerX}
                  baseY={baseY}
                  state={cubeState}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const TEAM_HIERARCHY = {
  centerX: 180,
  adminY: 52,
  adminBottomY: 80,
  junctionY: 118,
  managerY: 172,
  leftX: 62,
  centerMgrX: 180,
  rightX: 298,
  viewW: 360,
  viewH: 248,
} as const;

function TeamUserAvatar({
  cx,
  cy,
  r,
  initial,
}: {
  cx: number;
  cy: number;
  r: number;
  initial: string;
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`rgba(${VERDAN_RGB}, 0.12)`}
        stroke={VERDAN}
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy + r * 0.38}
        textAnchor="middle"
        fill={VERDAN}
        style={{
          fontSize: r * 1.05,
          fontWeight: 600,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {initial}
      </text>
    </g>
  );
}

function TeamRoleTag({
  centerX,
  y,
  label,
  width = 72,
}: {
  centerX: number;
  y: number;
  label: string;
  width?: number;
}) {
  const h = 13;
  const x = centerX - width / 2;
  return (
    <g>
      <rect
        x={x}
        y={y - h + 4}
        width={width}
        height={h}
        rx={4}
        fill={`rgba(${VERDAN_RGB}, 0.12)`}
        stroke={`rgba(${VERDAN_RGB}, 0.32)`}
        strokeWidth={1}
      />
      <text
        x={centerX}
        y={y}
        textAnchor="middle"
        fill={VERDAN}
        style={{
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.06em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </text>
    </g>
  );
}

function TeamHierarchyCard({
  centerX,
  centerY,
  initial,
  siteName,
  variant = "manager",
}: {
  centerX: number;
  centerY: number;
  initial: string;
  siteName?: string;
  variant?: "admin" | "manager";
}) {
  const isAdmin = variant === "admin";
  const outerPad = 6;
  const cardW = isAdmin ? 100 : 108;
  const cardH = isAdmin ? 44 : 52;
  const pad = 10;
  const avatarR = isAdmin ? 14 : 12;

  const innerX = centerX - cardW / 2;
  const innerY = centerY - cardH / 2;
  const ox = innerX - outerPad;
  const oy = innerY - outerPad;
  const outerW = cardW + outerPad * 2;
  const outerH = cardH + outerPad * 2;
  const avatarCx = innerX + pad + avatarR;
  const avatarCy = innerY + cardH / 2;
  const textX = innerX + pad + avatarR * 2 + 7;
  const badgeY = avatarCy + 1;
  const roleTagY = oy + outerH + 14;

  return (
    <g>
      {isAdmin && (
        <rect
          x={ox}
          y={oy}
          width={outerW}
          height={outerH}
          rx={9}
          fill={`rgba(${VERDAN_RGB}, 0.05)`}
          stroke={`rgba(${VERDAN_RGB}, 0.22)`}
          strokeWidth={1.5}
        />
      )}
      <rect
        x={innerX}
        y={innerY}
        width={cardW}
        height={cardH}
        rx={7}
        fill="white"
        stroke="rgba(14,14,14,0.12)"
        strokeWidth={1.25}
      />
      <TeamUserAvatar cx={avatarCx} cy={avatarCy} r={avatarR} initial={initial} />
      {isAdmin && <TeamRoleTag centerX={textX + 19} y={badgeY} label="ADMIN" width={38} />}
      {siteName && (
        <text
          x={textX}
          y={avatarCy + 3}
          fill={VERDAN}
          style={{
            fontSize: 8.5,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {siteName}
        </text>
      )}
      {!isAdmin && (
        <TeamRoleTag centerX={centerX} y={roleTagY} label="Site Manager" width={76} />
      )}
    </g>
  );
}

function TeamViz() {
  const {
    centerX,
    adminY,
    adminBottomY,
    junctionY,
    managerY,
    leftX,
    centerMgrX,
    rightX,
    viewW,
    viewH,
  } = TEAM_HIERARCHY;
  const managerTopY = managerY - 26;

  return (
    <div className="relative flex h-full min-h-[14rem] w-full items-center justify-center px-1 py-2 md:min-h-[16rem]">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="h-auto w-full max-w-[440px]"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <ReportsDottedPath
          d={`M ${centerX} ${adminBottomY} V ${junctionY}`}
          delay={0}
        />
        <ReportsDottedPath
          d={`M ${centerX} ${junctionY} H ${leftX} V ${managerTopY}`}
          delay={0.35}
        />
        <ReportsDottedPath
          d={`M ${centerX} ${junctionY} V ${managerTopY}`}
          delay={0.7}
        />
        <ReportsDottedPath
          d={`M ${centerX} ${junctionY} H ${rightX} V ${managerTopY}`}
          delay={1.05}
        />

        <TeamHierarchyCard
          centerX={centerX}
          centerY={adminY}
          initial="A"
          variant="admin"
        />
        <TeamHierarchyCard
          centerX={leftX}
          centerY={managerY}
          siteName="North site"
          initial="N"
        />
        <TeamHierarchyCard
          centerX={centerMgrX}
          centerY={managerY}
          siteName="Central site"
          initial="C"
        />
        <TeamHierarchyCard
          centerX={rightX}
          centerY={managerY}
          siteName="East site"
          initial="E"
        />
      </svg>
    </div>
  );
}

const DEVICE_STROKE = "rgba(14, 14, 14, 0.12)";
const DEVICE_FRAME_H = 112;
const DEVICE_LAYOUT = {
  baseline: 200,
  laptopW: 220,
  tabletW: 180,
  phoneW: 64,
  laptopTabletGap: -2,
  tabletPhoneOverlap: 34,
  viewW: 480,
  viewH: 218,
} as const;

const DEVICE_SYNC_PHASES = [
  {
    event: "Tree verified",
    tree: "Oak",
    treeId: "c89fa42d",
    metric: "1,847",
    metricLabel: "trees logged",
    progress: 98,
    badge: "Verified",
    coords: "15.325°, 75.968°",
  },
  {
    event: "Photo synced",
    tree: "Pine",
    treeId: "c89fa447",
    metric: "98.2%",
    metricLabel: "survival rate",
    progress: 82,
    badge: "Synced",
    coords: "15.326°, 75.969°",
  },
  {
    event: "GPS locked",
    tree: "Bush",
    treeId: "c89fa46a",
    metric: "24",
    metricLabel: "sites live",
    progress: 100,
    badge: "Live",
    coords: "15.327°, 75.970°",
  },
  {
    event: "Record saved",
    tree: "Neem",
    treeId: "c89fa48b",
    metric: "+1",
    metricLabel: "new tree",
    progress: 91,
    badge: "Saved",
    coords: "15.328°, 75.971°",
  },
] as const;

type DeviceSyncPhase = (typeof DEVICE_SYNC_PHASES)[number];

function DeviceSyncPulse({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={3} fill={VERDAN} />
      <circle cx={cx} cy={cy} r={3} fill={VERDAN} opacity={0.45}>
        <animate
          attributeName="r"
          from="3"
          to="8"
          dur="1.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.45"
          to="0"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

function DeviceHaritBadge({
  x,
  y,
  label,
  compact = false,
}: {
  x: number;
  y: number;
  label: string;
  compact?: boolean;
}) {
  const w = compact ? 28 : 36;
  const h = compact ? 7 : 8;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        fill={`rgba(${VERDAN_RGB}, 0.14)`}
        stroke={`rgba(${VERDAN_RGB}, 0.28)`}
        strokeWidth={0.75}
      />
      <text
        x={x + w / 2}
        y={y + h - 2}
        textAnchor="middle"
        fill={VERDAN}
        style={{
          fontSize: compact ? 4 : 4.5,
          fontWeight: 600,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </text>
    </g>
  );
}

function DeviceLaptopHaritScreen({
  screenX,
  screenY,
  screenW,
  screenH,
  phase,
}: {
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  phase: DeviceSyncPhase;
}) {
  const rows = [
    { id: "c89fa42d", name: "Oak", status: "Verified" },
    { id: "c89fa447", name: "Pine", status: "Pending" },
    { id: "c89fa46a", name: "Bush", status: "Verified" },
  ];
  const activeIdx = rows.findIndex((r) => r.name === phase.tree);

  return (
    <g>
      <text
        x={screenX + 8}
        y={screenY + 11}
        fill={VERDAN}
        style={{ fontSize: 7.5, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}
      >
        Harit
      </text>
      <text
        x={screenX + 38}
        y={screenY + 11}
        fill="rgba(14,14,14,0.45)"
        style={{ fontSize: 5.5, fontWeight: 500, fontFamily: "system-ui, sans-serif" }}
      >
        Greenfield Site
      </text>
      <DeviceSyncPulse cx={screenX + screenW - 52} cy={screenY + 8} />
      <text
        x={screenX + screenW - 8}
        y={screenY + 11}
        textAnchor="end"
        fill="rgba(14,14,14,0.72)"
        style={{ fontSize: 5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.event}
      </text>

      <rect
        x={screenX + 6}
        y={screenY + 16}
        width={screenW - 12}
        height={screenH - 38}
        rx={4}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={0.9}
      />
      <text
        x={screenX + 10}
        y={screenY + 24}
        fill="rgba(14,14,14,0.4)"
        style={{ fontSize: 4.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        TREE ID
      </text>
      <text
        x={screenX + 52}
        y={screenY + 24}
        fill="rgba(14,14,14,0.4)"
        style={{ fontSize: 4.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        SPECIES
      </text>
      <text
        x={screenX + screenW - 10}
        y={screenY + 24}
        textAnchor="end"
        fill="rgba(14,14,14,0.4)"
        style={{ fontSize: 4.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        STATUS
      </text>
      <line
        x1={screenX + 8}
        y1={screenY + 27}
        x2={screenX + screenW - 8}
        y2={screenY + 27}
        stroke="rgba(14,14,14,0.08)"
        strokeWidth={0.75}
      />

      {rows.map((row, i) => {
        const rowY = screenY + 32 + i * 11;
        const isActive = i === activeIdx;
        return (
          <g key={row.id}>
            {isActive ? (
              <rect
                x={screenX + 8}
                y={rowY - 7}
                width={screenW - 16}
                height={10}
                rx={2}
                fill={`rgba(${VERDAN_RGB}, 0.1)`}
              />
            ) : null}
            <text
              x={screenX + 10}
              y={rowY}
              fill={isActive ? "rgba(14,14,14,0.9)" : "rgba(14,14,14,0.55)"}
              style={{
                fontSize: 5,
                fontWeight: isActive ? 600 : 400,
                fontFamily: "monospace, system-ui, sans-serif",
              }}
            >
              {row.id.slice(0, 8)}
            </text>
            <text
              x={screenX + 52}
              y={rowY}
              fill={isActive ? "rgba(14,14,14,0.88)" : "rgba(14,14,14,0.5)"}
              style={{ fontSize: 5, fontFamily: "system-ui, sans-serif" }}
            >
              {row.name}
            </text>
            <text
              x={screenX + screenW - 10}
              y={rowY}
              textAnchor="end"
              fill={row.status === "Verified" ? VERDAN : "rgba(14,14,14,0.35)"}
              style={{ fontSize: 4.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
            >
              {row.status}
            </text>
          </g>
        );
      })}

      <rect
        x={screenX + 8}
        y={screenY + screenH - 18}
        width={screenW * 0.42}
        height={10}
        rx={3}
        fill={`rgba(${VERDAN_RGB}, 0.08)`}
      />
      <text
        x={screenX + 12}
        y={screenY + screenH - 10.5}
        fill="rgba(14,14,14,0.75)"
        style={{ fontSize: 5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.metric} {phase.metricLabel}
      </text>
      <rect
        x={screenX + screenW * 0.48}
        y={screenY + screenH - 18}
        width={screenW * 0.46}
        height={10}
        rx={3}
        fill={`rgba(${VERDAN_RGB}, 0.06)`}
        stroke={DEVICE_STROKE}
        strokeWidth={0.6}
      />
      <text
        x={screenX + screenW * 0.52}
        y={screenY + screenH - 10.5}
        fill="rgba(14,14,14,0.5)"
        style={{ fontSize: 4.5, fontFamily: "monospace, system-ui, sans-serif" }}
      >
        {phase.coords}
      </text>
    </g>
  );
}

function DeviceTabletHaritScreen({
  screenX,
  screenY,
  screenW,
  screenH,
  phase,
}: {
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  phase: DeviceSyncPhase;
}) {
  const cardX = screenX + 8;
  const cardY = screenY + 18;
  const cardW = screenW - 16;
  const cardH = screenH - 28;
  const barW = (cardW - 16) * (phase.progress / 100);

  return (
    <g>
      <text
        x={screenX + 8}
        y={screenY + 11}
        fill={VERDAN}
        style={{ fontSize: 7, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}
      >
        Harit
      </text>
      <DeviceSyncPulse cx={screenX + screenW - 10} cy={screenY + 8} />
      <text
        x={screenX + screenW - 18}
        y={screenY + 11}
        textAnchor="end"
        fill="rgba(14,14,14,0.55)"
        style={{ fontSize: 4.5, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.event}
      </text>

      <rect
        x={cardX}
        y={cardY}
        width={cardW}
        height={cardH}
        rx={5}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={0.9}
      />
      <circle
        cx={cardX + 14}
        cy={cardY + 18}
        r={9}
        fill={`rgba(${VERDAN_RGB}, 0.14)`}
        stroke={`rgba(${VERDAN_RGB}, 0.25)`}
        strokeWidth={0.75}
      />
      <text
        x={cardX + 14}
        y={cardY + 21}
        textAnchor="middle"
        fill={VERDAN}
        style={{ fontSize: 7, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.tree.charAt(0)}
      </text>
      <text
        x={cardX + 28}
        y={cardY + 16}
        fill="rgba(14,14,14,0.88)"
        style={{ fontSize: 6.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.tree}
      </text>
      <text
        x={cardX + 28}
        y={cardY + 24}
        fill="rgba(14,14,14,0.42)"
        style={{ fontSize: 4.5, fontFamily: "monospace, system-ui, sans-serif" }}
      >
        {phase.treeId}
      </text>
      <DeviceHaritBadge
        x={cardX + cardW - 40}
        y={cardY + 10}
        label={phase.badge}
        compact
      />

      <text
        x={cardX + 10}
        y={cardY + cardH - 22}
        fill="rgba(14,14,14,0.45)"
        style={{ fontSize: 4.5, fontFamily: "system-ui, sans-serif" }}
      >
        Verification
      </text>
      <text
        x={cardX + cardW - 10}
        y={cardY + cardH - 22}
        textAnchor="end"
        fill={VERDAN}
        style={{ fontSize: 5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.progress}%
      </text>
      <rect
        x={cardX + 10}
        y={cardY + cardH - 16}
        width={cardW - 20}
        height={4}
        rx={2}
        fill={`rgba(${VERDAN_RGB}, 0.1)`}
      />
      <rect
        x={cardX + 10}
        y={cardY + cardH - 16}
        width={barW}
        height={4}
        rx={2}
        fill={VERDAN}
        opacity={0.85}
      />

      <text
        x={cardX + 10}
        y={cardY + cardH - 6}
        fill="rgba(14,14,14,0.5)"
        style={{ fontSize: 4.5, fontFamily: "monospace, system-ui, sans-serif" }}
      >
        {phase.coords}
      </text>
    </g>
  );
}

function DevicePhoneHaritScreen({
  screenX,
  screenY,
  screenW,
  screenH,
  cx,
  phase,
}: {
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  cx: number;
  phase: DeviceSyncPhase;
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={screenY + 12}
        r={7}
        fill={`rgba(${VERDAN_RGB}, 0.16)`}
        stroke={`rgba(${VERDAN_RGB}, 0.3)`}
        strokeWidth={0.75}
      />
      <text
        x={cx}
        y={screenY + 14.5}
        textAnchor="middle"
        fill={VERDAN}
        style={{ fontSize: 6, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}
      >
        H
      </text>
      <DeviceSyncPulse cx={screenX + screenW - 6} cy={screenY + 10} />

      <text
        x={cx}
        y={screenY + 28}
        textAnchor="middle"
        fill="rgba(14,14,14,0.88)"
        style={{ fontSize: 9, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.metric}
      </text>
      <text
        x={cx}
        y={screenY + 36}
        textAnchor="middle"
        fill="rgba(14,14,14,0.45)"
        style={{ fontSize: 4.5, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.metricLabel}
      </text>

      <rect
        x={screenX + 5}
        y={screenY + 42}
        width={screenW - 10}
        height={14}
        rx={4}
        fill={`rgba(${VERDAN_RGB}, 0.08)`}
        stroke={DEVICE_STROKE}
        strokeWidth={0.6}
      />
      <text
        x={cx}
        y={screenY + 51}
        textAnchor="middle"
        fill="rgba(14,14,14,0.75)"
        style={{ fontSize: 4.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.tree}
      </text>

      <rect
        x={screenX + 6}
        y={screenY + screenH - 18}
        width={screenW - 12}
        height={10}
        rx={4}
        fill={VERDAN}
      />
      <text
        x={cx}
        y={screenY + screenH - 10.5}
        textAnchor="middle"
        fill="#ffffff"
        style={{ fontSize: 4.5, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.badge}
      </text>
      <text
        x={cx}
        y={screenY + screenH - 4}
        textAnchor="middle"
        fill="rgba(14,14,14,0.35)"
        style={{ fontSize: 3.5, fontFamily: "system-ui, sans-serif" }}
      >
        {phase.event}
      </text>
    </g>
  );
}

function DeviceLaptopMock({
  cx,
  baseline,
  renderPhase,
  contentVisible,
}: {
  cx: number;
  baseline: number;
  renderPhase: number;
  contentVisible: boolean;
}) {
  const phase = DEVICE_SYNC_PHASES[renderPhase % DEVICE_SYNC_PHASES.length];
  const totalW = DEVICE_LAYOUT.laptopW;
  const screenW = 188;
  const screenH = 112;
  const baseH = 12;
  const lidPad = 7;
  const totalH = lidPad + screenH + lidPad + baseH + 2;
  const x = cx - totalW / 2;
  const y = baseline - totalH;
  const screenX = x + (totalW - screenW) / 2;
  const screenY = y + lidPad;

  return (
    <g>
      <rect
        x={x}
        y={screenY + screenH + lidPad}
        width={totalW}
        height={baseH}
        rx={3}
        fill={`rgba(${VERDAN_RGB}, 0.08)`}
        stroke={DEVICE_STROKE}
        strokeWidth={1}
      />
      <rect
        x={x + 5}
        y={y}
        width={totalW - 10}
        height={screenH + lidPad * 2}
        rx={7}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={1.25}
      />
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={4}
        fill={`rgba(${VERDAN_RGB}, 0.04)`}
        stroke="rgba(14,14,14,0.06)"
        strokeWidth={1}
      />
      <g
        className="device-sync-screen-fade"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        <DeviceLaptopHaritScreen
          screenX={screenX}
          screenY={screenY}
          screenW={screenW}
          screenH={screenH}
          phase={phase}
        />
      </g>
    </g>
  );
}

function DeviceTabletMock({
  cx,
  baseline,
  renderPhase,
  contentVisible,
}: {
  cx: number;
  baseline: number;
  renderPhase: number;
  contentVisible: boolean;
}) {
  const phase = DEVICE_SYNC_PHASES[renderPhase % DEVICE_SYNC_PHASES.length];
  const frameW = DEVICE_LAYOUT.tabletW;
  const frameH = DEVICE_FRAME_H;
  const pad = 5;
  const x = cx - frameW / 2;
  const y = baseline - frameH;
  const screenX = x + pad;
  const screenY = y + pad;
  const screenW = frameW - pad * 2;
  const screenH = frameH - pad * 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={frameW}
        height={frameH}
        rx={8}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={1.25}
      />
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={4}
        fill={`rgba(${VERDAN_RGB}, 0.04)`}
        stroke="rgba(14,14,14,0.06)"
        strokeWidth={1}
      />
      <g
        className="device-sync-screen-fade"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        <DeviceTabletHaritScreen
          screenX={screenX}
          screenY={screenY}
          screenW={screenW}
          screenH={screenH}
          phase={phase}
        />
      </g>
    </g>
  );
}

function DevicePhoneMock({
  cx,
  baseline,
  renderPhase,
  contentVisible,
}: {
  cx: number;
  baseline: number;
  renderPhase: number;
  contentVisible: boolean;
}) {
  const phase = DEVICE_SYNC_PHASES[renderPhase % DEVICE_SYNC_PHASES.length];
  const frameW = DEVICE_LAYOUT.phoneW;
  const frameH = DEVICE_FRAME_H;
  const pad = 4;
  const x = cx - frameW / 2;
  const y = baseline - frameH;
  const screenX = x + pad;
  const screenY = y + pad;
  const screenW = frameW - pad * 2;
  const screenH = frameH - pad * 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={frameW}
        height={frameH}
        rx={11}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={1.25}
      />
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={6}
        fill={`rgba(${VERDAN_RGB}, 0.04)`}
        stroke="rgba(14,14,14,0.06)"
        strokeWidth={1}
      />
      <g
        className="device-sync-screen-fade"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        <DevicePhoneHaritScreen
          screenX={screenX}
          screenY={screenY}
          screenW={screenW}
          screenH={screenH}
          cx={cx}
          phase={phase}
        />
      </g>
    </g>
  );
}

function DeviceViz() {
  const { ref, inView } = useInView<HTMLDivElement>(0.08, false);
  const [syncPhase, setSyncPhase] = useState(0);
  const { renderPhase, contentVisible } = useSyncedDisplayPhase(syncPhase);
  const { baseline, laptopW, tabletW, phoneW, laptopTabletGap, tabletPhoneOverlap, viewW, viewH } =
    DEVICE_LAYOUT;

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => {
      setSyncPhase((p) => (p + 1) % DEVICE_SYNC_PHASES.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, [inView]);

  const laptopCx = laptopW / 2;
  const tabletCx = laptopW + laptopTabletGap + tabletW / 2;
  const phoneCx = tabletCx + tabletW / 2 + phoneW / 2 - tabletPhoneOverlap;
  const groupRight = phoneCx + phoneW / 2;
  const offsetX = (viewW - groupRight) / 2;
  const activePhase = DEVICE_SYNC_PHASES[renderPhase % DEVICE_SYNC_PHASES.length];

  return (
    <div
      ref={ref}
      className="relative flex h-full min-h-[16rem] w-full flex-col items-center justify-center px-2 py-3 md:min-h-[18rem]"
    >
      <p
        className="mb-4 text-center text-[12px] font-medium text-[rgba(14,14,14,0.55)]"
        aria-live="polite"
      >
        <span className="inline-flex items-center justify-center gap-1.5">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--verdan-green)] opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--verdan-green)]" />
          </span>
          Synced on laptop, tablet &amp; phone —{" "}
          <span
            className="device-sync-caption-event font-semibold text-[rgba(14,14,14,0.78)]"
            style={{ opacity: contentVisible ? 1 : 0 }}
          >
            {activePhase.event}
          </span>
        </span>
      </p>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="h-auto w-full max-w-[520px]"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${offsetX}, 0)`}>
          <DeviceLaptopMock
            cx={laptopCx}
            baseline={baseline}
            renderPhase={renderPhase}
            contentVisible={contentVisible}
          />
          <DeviceTabletMock
            cx={tabletCx}
            baseline={baseline}
            renderPhase={renderPhase}
            contentVisible={contentVisible}
          />
          <DevicePhoneMock
            cx={phoneCx}
            baseline={baseline}
            renderPhase={renderPhase}
            contentVisible={contentVisible}
          />
        </g>
      </svg>
    </div>
  );
}

const REPORTS_CHART_YELLOW = "#e8a838";
const REPORTS_LAYOUT = {
  viewW: 480,
  viewH: 200,
  sourceX: 136,
  bendX: 220,
  endX: 380,
  csvY: 32,
  xlsxY: 100,
  pdfY: 168,
  topY: 72,
  bottomY: 128,
  chartBox: { x: 28, y: 44, w: 108, h: 108 },
} as const;

function ReportsDottedPath({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={VERDAN}
      strokeWidth="1.5"
      strokeOpacity="0.38"
      strokeDasharray="4 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <animate
        attributeName="stroke-dashoffset"
        from="0"
        to="-20"
        dur="2.2s"
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </path>
  );
}

const EXPORT_BADGE = {
  csv: { fill: "#3eb8ad", label: "CSV" },
  xlx: { fill: "#4caf50", label: "XLX" },
  pdf: { fill: "#f24b6a", label: "PDF" },
} as const;

function ExportFileDocFrame({
  x,
  y,
  badge,
  children,
}: {
  x: number;
  y: number;
  badge: keyof typeof EXPORT_BADGE;
  children: React.ReactNode;
}) {
  const { fill: badgeFill, label } = EXPORT_BADGE[badge];

  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={-17}
        y={-23}
        width={40}
        height={54}
        rx={10}
        fill="rgba(14,14,14,0.06)"
        transform="translate(2.5, 3.5)"
      />
      <rect
        x={-20}
        y={-26}
        width={40}
        height={52}
        rx={11}
        fill="#ffffff"
        stroke="rgba(14,14,14,0.1)"
        strokeWidth={1}
      />
      <path
        d="M 9 -26 L 20 -26 L 20 -15 L 9 -26 Z"
        fill="#f6f6f4"
        stroke="rgba(14,14,14,0.08)"
        strokeWidth={0.75}
      />
      <path
        d="M 12 -26 L 20 -18 L 20 -26 Z"
        fill="#ececea"
        stroke="rgba(14,14,14,0.06)"
        strokeWidth={0.5}
      />
      {children}
      <rect
        x={4}
        y={12}
        width={label.length > 3 ? 26 : 24}
        height={11}
        rx={5.5}
        fill={badgeFill}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
      />
      <text
        x={4 + (label.length > 3 ? 13 : 12)}
        y={19.5}
        textAnchor="middle"
        fill="#ffffff"
        style={{
          fontSize: 6.5,
          fontWeight: 700,
          letterSpacing: "0.04em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </text>
    </g>
  );
}

function CsvOutputIcon({ x, y }: { x: number; y: number }) {
  const cols = 3;
  const rows = 7;
  const cellW = 7.5;
  const cellH = 3.2;
  const gapX = 2.2;
  const gapY = 2;
  const startX = -20 + (40 - (cols * cellW + (cols - 1) * gapX)) / 2;
  const startY = -26 + 10;

  return (
    <ExportFileDocFrame x={x} y={y} badge="csv">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={startX + col * (cellW + gapX)}
            y={startY + row * (cellH + gapY)}
            width={cellW}
            height={cellH}
            rx={cellH / 2}
            fill={row === 0 ? "rgba(14,14,14,0.16)" : "rgba(14,14,14,0.07)"}
          />
        )),
      )}
    </ExportFileDocFrame>
  );
}

function ExcelOutputIcon({ x, y }: { x: number; y: number }) {
  const cols = 3;
  const rows = 8;
  const cellW = 9;
  const cellH = 4.5;
  const startX = -14;
  const startY = -14;

  return (
    <ExportFileDocFrame x={x} y={y} badge="xlx">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={startX + col * cellW}
            y={startY + row * cellH}
            width={cellW - 1}
            height={cellH - 1}
            rx={0.5}
            fill={row === 0 ? "rgba(14,14,14,0.14)" : "#ffffff"}
            stroke="rgba(14,14,14,0.08)"
            strokeWidth={0.6}
          />
        )),
      )}
    </ExportFileDocFrame>
  );
}

function PdfOutputIcon({ x, y }: { x: number; y: number }) {
  const dashLines = [
    { y: -12, w: 22 },
    { y: -6, w: 24 },
    { y: 0, w: 20 },
    { y: 6, w: 23 },
    { y: 12, w: 18 },
  ];

  return (
    <ExportFileDocFrame x={x} y={y} badge="pdf">
      <rect
        x={-11}
        y={-16}
        width={18}
        height={2.5}
        rx={1.25}
        fill="rgba(14,14,14,0.14)"
      />
      {dashLines.map((line, i) => (
        <line
          key={i}
          x1={-12}
          y1={line.y}
          x2={-12 + line.w}
          y2={line.y}
          stroke="rgba(14,14,14,0.12)"
          strokeWidth={1.2}
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
      ))}
      <rect
        x={-12}
        y={18}
        width={16}
        height={3}
        rx={1}
        fill="rgba(14,14,14,0.88)"
      />
    </ExportFileDocFrame>
  );
}

const REPORTS_CHART_BARS = [
  { h: 28, color: VERDAN },
  { h: 42, color: VERDAN },
  { h: 36, color: REPORTS_CHART_YELLOW },
  { h: 48, color: VERDAN },
  { h: 38, color: VERDAN },
] as const;

function ReportsExportChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { x: boxX, y: boxY, w: boxW, h: boxH } = REPORTS_LAYOUT.chartBox;
  const barW = 10;
  const barGap = 9;
  const bars = REPORTS_CHART_BARS;
  const maxBarH = Math.max(...bars.map((b) => b.h));
  const barsRowW = bars.length * barW + (bars.length - 1) * barGap;
  const startX = boxX + (boxW - barsRowW) / 2;
  const baselineY = boxY + boxH / 2 + maxBarH / 2;

  return (
    <g>
      <rect
        x={boxX}
        y={boxY}
        width={boxW}
        height={boxH}
        rx={8}
        fill="#ffffff"
        stroke="rgba(14,14,14,0.1)"
        strokeWidth={1}
      />
      <line
        x1={boxX + 14}
        y1={baselineY + 0.5}
        x2={boxX + boxW - 14}
        y2={baselineY + 0.5}
        stroke="rgba(14,14,14,0.08)"
        strokeWidth={1}
      />
      {bars.map((bar, i) => {
        const isHovered = hovered === i;
        const lift = isHovered ? 4 : 0;
        const height = isHovered ? bar.h * 1.1 : bar.h;
        const barX = startX + i * (barW + barGap);
        const barY = baselineY - height - lift;
        return (
          <rect
            key={i}
            x={barX}
            y={barY}
            width={barW}
            height={height}
            rx={3}
            fill={bar.color}
            opacity={isHovered ? 1 : 0.82}
            className="cursor-pointer"
            style={{
              transition:
                "y 220ms cubic-bezier(0.4, 0, 0.2, 1), height 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-out",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        );
      })}
    </g>
  );
}

function ReportsViz() {
  const {
    viewW,
    viewH,
    sourceX,
    bendX,
    endX,
    csvY,
    xlsxY,
    pdfY,
    topY,
    bottomY,
  } = REPORTS_LAYOUT;

  return (
    <div className="relative h-56 w-full overflow-visible px-1 pb-2 pt-2 md:h-60 md:px-2">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="h-full w-full max-w-[560px] translate-x-6 md:translate-x-8"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <ReportsExportChart />

        <ReportsDottedPath
          d={`M ${sourceX} ${topY} H ${bendX} V ${csvY} H ${endX}`}
          delay={0}
        />
        <ReportsDottedPath
          d={`M ${sourceX} ${xlsxY} H ${endX}`}
          delay={0.35}
        />
        <ReportsDottedPath
          d={`M ${sourceX} ${bottomY} H ${bendX} V ${pdfY} H ${endX}`}
          delay={0.7}
        />

        <CsvOutputIcon x={endX + 4} y={csvY} />
        <ExcelOutputIcon x={endX + 4} y={xlsxY} />
        <PdfOutputIcon x={endX + 4} y={pdfY} />
      </svg>
    </div>
  );
}

const UPTIME_BAR_COUNT = 45;
const UPTIME_WARN = "#e8a838";
const UPTIME_DOWN = "#e05a5a";
const UPTIME_DOWN_DAYS = new Set([26]);
const UPTIME_WARN_DAYS = new Set([7, 17, 30, 41]);
const UPTIME_AGGREGATE = 99.9;

type UptimeBar = {
  color: string;
  heightPx: number;
  uptime: number;
  opacity: number;
};

function buildUptimeBars(): UptimeBar[] {
  return Array.from({ length: UPTIME_BAR_COUNT }, (_, i) => {
    if (UPTIME_DOWN_DAYS.has(i)) {
      return { color: UPTIME_DOWN, heightPx: 30, uptime: 94.2, opacity: 0.92 };
    }
    if (UPTIME_WARN_DAYS.has(i)) {
      return { color: UPTIME_WARN, heightPx: 36, uptime: 98.7, opacity: 0.92 };
    }
    const daySpread = ((i * 7) % 11) * 0.01;
    return {
      color: VERDAN,
      heightPx: 44,
      uptime: Math.min(100, 99.92 + daySpread),
      opacity: 0.82,
    };
  });
}

const UPTIME_BARS = buildUptimeBars();

function formatUptimePercent(value: number) {
  if (value >= 100) return "100%";
  return `${value.toFixed(1)}%`;
}

function UptimeViz() {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayUptime =
    hovered !== null ? UPTIME_BARS[hovered].uptime : UPTIME_AGGREGATE;

  return (
    <div className="relative flex h-full min-h-[16rem] w-full items-center justify-center px-2 py-3 md:min-h-[18rem]">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center justify-between text-[14px] font-semibold text-[rgba(14,14,14,0.88)] md:text-[15px]">
          <span>Uptime</span>
          <span className="tabular-nums transition-[opacity] duration-200">
            {formatUptimePercent(displayUptime)}
          </span>
        </div>

        <div
          className="mt-7 flex h-[4.75rem] items-end gap-[3px] md:h-[5.25rem]"
          role="img"
          aria-label="45-day uptime history"
        >
          {UPTIME_BARS.map((bar, i) => {
            const isHovered = hovered === i;
            return (
              <button
                type="button"
                key={i}
                className={cn(
                  "min-w-0 flex-1 cursor-pointer rounded-full transition-all duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--verdan-green)]/40",
                )}
                style={{
                  height: isHovered ? bar.heightPx * 1.2 : bar.heightPx,
                  backgroundColor: bar.color,
                  opacity: bar.opacity,
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                aria-label={`Day ${i + 1}: ${formatUptimePercent(bar.uptime)} uptime`}
              />
            );
          })}
        </div>

        <div className="mt-5 flex justify-between text-[11px] text-[rgba(14,14,14,0.42)]">
          <span>45 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

function SmallFeatureCard({
  title,
  desc,
  viz,
  delay,
  inView,
  className,
  descClassName,
}: {
  title: string;
  desc: string;
  viz: React.ReactNode;
  delay: number;
  inView: boolean;
  className?: string;
  descClassName?: string;
}) {
  return (
    <BentoCard
      inView={inView}
      delay={delay}
      className={cn("flex h-full flex-col", className)}
    >
      <div className="flex flex-1 flex-col items-center justify-center overflow-visible px-4 pb-4 pt-6 md:px-5 md:pt-8">
        {viz}
      </div>
      <div className="mt-auto">
        <CardHead
          title={title}
          desc={desc}
          className="!pt-2 md:!pt-3"
          descClassName={descClassName}
        />
      </div>
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
          <div className="md:col-span-2">
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
          <div className="h-full">
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

          <div className="h-full">
            <BentoCard
              inView={gridIn}
              delay={160}
              className="flex h-full flex-col overflow-visible"
            >
              <div className="mt-auto">
                <PhotoViz />
                <CardHead
                  title="Photo verification system"
                  desc="Timestamped tree photos flow into clean approval workflows."
                  className="!px-6 !pt-4 !pb-6 md:!px-7 md:!pt-5 md:!pb-7"
                />
              </div>
            </BentoCard>
          </div>

          {/* Growth + data export */}
          <div className="h-full">
            <BentoCard
              inView={gridIn}
              delay={240}
              className="flex h-full flex-col"
            >
              <GrowthViz />
              <div className="mt-auto">
                <CardHead
                  title="Growth monitoring"
                  desc="Track survival and growth from sapling to mature canopy."
                  className="!pt-2 md:!pt-3"
                />
              </div>
            </BentoCard>
          </div>

          <div className="h-full">
            <BentoCard
              inView={gridIn}
              delay={320}
              className="flex h-full flex-col"
            >
              <div className="mt-auto">
                <ReportsViz />
                <CardHead
                  title="Data export & reports"
                  desc="Turn plantation records into shareable analytics, instantly."
                  className="!px-6 !pt-1.5 !pb-6 md:!px-7 md:!pb-7"
                />
              </div>
            </BentoCard>
          </div>

          {/* Team administration + site management */}
          <div className="h-full">
            <SmallFeatureCard
              title="Team administration"
              desc="Assign field teams to specific plantation sites."
              viz={<TeamViz />}
              delay={400}
              inView={gridIn}
            />
          </div>

          <div className="h-full">
            <SmallFeatureCard
              title="Site management"
              desc="Manage multiple plantation locations efficiently."
              viz={<SitesViz />}
              delay={480}
              inView={gridIn}
              className="!overflow-visible"
            />
          </div>

          {/* Mobile friendly + platform uptime */}
          <div className="h-full">
            <SmallFeatureCard
              title="Mobile friendly"
              desc="Built for field teams on any device."
              viz={<DeviceViz />}
              delay={560}
              inView={gridIn}
              className="!overflow-visible"
            />
          </div>

          <div className="h-full">
            <SmallFeatureCard
              title="Platform uptime"
              desc="45-day uptime history across all plantation sites."
              descClassName="!text-[13px] !leading-snug md:!text-[14px]"
              viz={<UptimeViz />}
              delay={640}
              inView={gridIn}
              className="!overflow-visible"
            />
          </div>

          {/* Full width: environmental accountability */}
          <div className="md:col-span-2">
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
