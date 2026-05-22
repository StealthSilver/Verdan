"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";
import HeroDashboard from "@/components/HeroDashboard";
import { DASHBOARD_TREE_AVATARS } from "@/components/dashboardTreeAvatars";
import { Globe } from "@/components/ui/Globe";
import { GrowthChart } from "@/components/GrowthChart";

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

const PHOTO_CARD_SIZE = 172;
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
              <span className="absolute left-2 top-2 z-10 text-[9px] font-medium tracking-tight text-gray-500">
                {label}
              </span>
              {isFront && (
                <div className="relative flex h-full w-full items-center justify-center px-2 pt-3.5">
                  <div className="h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[8px] ring-1 ring-gray-200">
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

const SITE_CUBE_EDGE = 36;
const SITE_CUBE_SIZE = 1;
const SITE_CUBE_INSET = 0.24;
const SITE_CUBE_CENTERS = [78, 168, 258] as const;
const SITE_CUBE_BASE_Y = 112;
const SITE_MGMT_BOX_DELAYS = ["0s", "1.2s", "2.4s"] as const;

function IsometricSiteCube({
  centerX,
  baseY,
}: {
  centerX: number;
  baseY: number;
}) {
  const edge = SITE_CUBE_EDGE;
  const s = SITE_CUBE_SIZE;
  const inset = SITE_CUBE_INSET;
  const originX = centerX;
  const originY = baseY - edge / 2;

  const stroke = "rgba(14, 14, 14, 0.16)";
  const strokeVerdan = VERDAN;

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

  return (
    <g>
      <ellipse
        cx={shadowX}
        cy={shadowY + edge * 0.14}
        rx={edge * 0.92}
        ry={edge * 0.22}
        fill={`rgba(${VERDAN_RGB}, 0.12)`}
      />
      <path
        d={isoPath(leftFace, originX, originY, edge)}
        fill={`rgba(${VERDAN_RGB}, 0.16)`}
        stroke="none"
      />
      <path
        d={isoPath(rightFace, originX, originY, edge)}
        fill={`rgba(${VERDAN_RGB}, 0.09)`}
        stroke="none"
      />
      <path
        d={isoPath(topFace, originX, originY, edge)}
        fill="#ffffff"
        stroke="none"
      />
      <path
        d={isoPath(topInset, originX, originY, edge)}
        fill={`rgba(${VERDAN_RGB}, 0.06)`}
        stroke="none"
      />
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
            strokeOpacity={0.3}
            strokeWidth={1.25}
            strokeDasharray="3 4"
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
            strokeOpacity={0.3}
            strokeWidth={1.25}
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
        );
      })}
      <path
        d={`M ${outline
          .map((c) => p(c).join(","))
          .join(" L ")} Z`}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={isoPath(topInset, originX, originY, edge)}
        fill="none"
        stroke={strokeVerdan}
        strokeOpacity={0.4}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <line
        {...{
          x1: p([0, 0, s])[0],
          y1: p([0, 0, s])[1],
          x2: p([s, s, s])[0],
          y2: p([s, s, s])[1],
        }}
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    </g>
  );
}

function SitesViz() {
  return (
    <div className="relative flex h-full min-h-[12rem] w-full items-center justify-center overflow-visible py-2 md:min-h-[13rem]">
      <svg
        viewBox="0 0 336 148"
        className="h-auto w-full max-w-[340px] overflow-visible"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        {SITE_CUBE_CENTERS.map((centerX, i) => (
          <g
            key={i}
            className="feature-site-mgmt-box"
            style={{ animationDelay: SITE_MGMT_BOX_DELAYS[i] }}
          >
            <IsometricSiteCube centerX={centerX} baseY={SITE_CUBE_BASE_Y} />
          </g>
        ))}
      </svg>
    </div>
  );
}

const TEAM_HIERARCHY = {
  centerX: 160,
  adminY: 52,
  adminBottomY: 80,
  junctionY: 118,
  managerY: 188,
  leftX: 52,
  centerMgrX: 160,
  rightX: 268,
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

function TeamHierarchyCard({
  centerX,
  centerY,
  initial,
  siteLines,
  variant = "manager",
}: {
  centerX: number;
  centerY: number;
  initial: string;
  siteLines?: readonly [string, string];
  variant?: "admin" | "manager";
}) {
  const isAdmin = variant === "admin";
  const outerPad = 6;
  const cardW = isAdmin ? 100 : 72;
  const cardH = isAdmin ? 44 : 48;
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
  const textX = innerX + pad + avatarR * 2 + 8;
  const badgeY = avatarCy + 1;

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
      {isAdmin && (
        <>
          <rect
            x={textX}
            y={badgeY - 9}
            width={38}
            height={13}
            rx={4}
            fill={`rgba(${VERDAN_RGB}, 0.12)`}
            stroke={`rgba(${VERDAN_RGB}, 0.32)`}
            strokeWidth={1}
          />
          <text
            x={textX + 19}
            y={badgeY}
            textAnchor="middle"
            fill={VERDAN}
            style={{
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            ADMIN
          </text>
        </>
      )}
      {siteLines && (
        <>
          <text
            x={textX}
            y={innerY + 19}
            fill={VERDAN}
            style={{
              fontSize: 9,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {siteLines[0]}
          </text>
          <text
            x={textX}
            y={innerY + 31}
            fill={VERDAN}
            style={{
              fontSize: 9,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {siteLines[1]}
          </text>
        </>
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
  } = TEAM_HIERARCHY;
  const managerTopY = managerY - 26;

  return (
    <div className="relative flex h-full min-h-[12rem] w-full items-center justify-center px-1 py-2 md:min-h-[13rem]">
      <svg
        viewBox="0 0 320 228"
        className="h-auto w-full max-w-[340px]"
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
          siteLines={["North", "site"]}
          initial="N"
        />
        <TeamHierarchyCard
          centerX={centerMgrX}
          centerY={managerY}
          siteLines={["Central", "site"]}
          initial="C"
        />
        <TeamHierarchyCard
          centerX={rightX}
          centerY={managerY}
          siteLines={["East", "site"]}
          initial="E"
        />
      </svg>
    </div>
  );
}

const DEVICE_STROKE = "rgba(14, 14, 14, 0.12)";
const DEVICE_TABLET_FRAME_H = 64;
const DEVICE_LAYOUT = {
  baseline: 130,
  laptopW: 124,
  tabletW: 112,
  phoneW: 32,
  laptopTabletGap: -6,
  tabletPhoneOverlap: 26,
  viewW: 300,
} as const;

function DeviceStatusPill({
  screenX,
  screenY,
  screenW,
  narrow = false,
}: {
  screenX: number;
  screenY: number;
  screenW: number;
  narrow?: boolean;
}) {
  const w = narrow ? screenW * 0.36 : screenW * 0.26;
  const h = 3.5;
  const x = screenX + (screenW - w) / 2;
  return (
    <rect
      x={x}
      y={screenY + 3}
      width={w}
      height={h}
      rx={h / 2}
      fill={`rgba(${VERDAN_RGB}, 0.12)`}
      stroke={`rgba(${VERDAN_RGB}, 0.22)`}
      strokeWidth={0.75}
    />
  );
}

function DeviceLaptopMock({ cx, baseline }: { cx: number; baseline: number }) {
  const totalW = DEVICE_LAYOUT.laptopW;
  const screenW = 110;
  const screenH = 66;
  const baseH = 8;
  const lidPad = 5;
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
        rx={2.5}
        fill={`rgba(${VERDAN_RGB}, 0.08)`}
        stroke={DEVICE_STROKE}
        strokeWidth={1}
      />
      <rect
        x={x + 4}
        y={y}
        width={totalW - 8}
        height={screenH + lidPad * 2}
        rx={6}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={1.25}
      />
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={3}
        fill={`rgba(${VERDAN_RGB}, 0.03)`}
        stroke="rgba(14,14,14,0.06)"
        strokeWidth={1}
      />
      <DeviceStatusPill screenX={screenX} screenY={screenY} screenW={screenW} />
      <rect
        x={screenX + 10}
        y={screenY + 14}
        width={40}
        height={3}
        rx={1.5}
        fill="rgba(14,14,14,0.82)"
      />
      <rect
        x={screenX + 10}
        y={screenY + 20}
        width={32}
        height={2}
        rx={1}
        fill="rgba(14,14,14,0.12)"
      />
      <rect
        x={screenX + 58}
        y={screenY + 12}
        width={28}
        height={32}
        rx={4}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={screenX + 62 + i * 4.5}
          y={screenY + 34 - (i % 3) * 2}
          width={3}
          height={8 + (i % 2) * 3}
          rx={0.75}
          fill={VERDAN}
          opacity={0.35 + i * 0.12}
        />
      ))}
      <rect
        x={screenX + 10}
        y={screenY + 28}
        width={38}
        height={24}
        rx={4}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
      />
      <rect
        x={screenX + 14}
        y={screenY + 34}
        width={22}
        height={2}
        rx={1}
        fill={VERDAN}
        opacity={0.65}
      />
      <rect
        x={screenX + 14}
        y={screenY + 39}
        width={18}
        height={1.5}
        rx={0.75}
        fill="rgba(14,14,14,0.1)"
      />
    </g>
  );
}

function DeviceTabletMock({ cx, baseline }: { cx: number; baseline: number }) {
  const frameW = DEVICE_LAYOUT.tabletW;
  const frameH = DEVICE_TABLET_FRAME_H;
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
        rx={6}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={1.25}
      />
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={3}
        fill={`rgba(${VERDAN_RGB}, 0.03)`}
        stroke="rgba(14,14,14,0.06)"
        strokeWidth={1}
      />
      <DeviceStatusPill screenX={screenX} screenY={screenY} screenW={screenW} />
      <rect
        x={screenX + 12}
        y={screenY + 14}
        width={screenW - 24}
        height={screenH - 22}
        rx={5}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
      />
      <text
        x={screenX + 18}
        y={screenY + 24}
        fill="rgba(14,14,14,0.85)"
        style={{ fontSize: 6, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        Field uptime
      </text>
      <text
        x={screenX + screenW - 18}
        y={screenY + 24}
        textAnchor="end"
        fill={VERDAN}
        style={{ fontSize: 6, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        99.9%
      </text>
      {Array.from({ length: 22 }).map((_, i) => (
        <rect
          key={i}
          x={screenX + 18 + i * 2.6}
          y={screenY + 36}
          width={1.5}
          height={10}
          rx={0.4}
          fill={VERDAN}
          opacity={0.3 + (i % 5) * 0.12}
        />
      ))}
    </g>
  );
}

function DevicePhoneMock({ cx, baseline }: { cx: number; baseline: number }) {
  const frameW = DEVICE_LAYOUT.phoneW;
  const frameH = DEVICE_TABLET_FRAME_H;
  const pad = 3;
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
        rx={9}
        fill="#ffffff"
        stroke={DEVICE_STROKE}
        strokeWidth={1.25}
      />
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={5}
        fill={`rgba(${VERDAN_RGB}, 0.03)`}
        stroke="rgba(14,14,14,0.06)"
        strokeWidth={1}
      />
      <DeviceStatusPill
        screenX={screenX}
        screenY={screenY}
        screenW={screenW}
        narrow
      />
      <rect
        x={screenX + 4}
        y={screenY + 12}
        width={screenW - 8}
        height={2.5}
        rx={1.25}
        fill="rgba(14,14,14,0.82)"
      />
      <rect
        x={screenX + 4}
        y={screenY + 17}
        width={screenW - 10}
        height={1.5}
        rx={0.75}
        fill="rgba(14,14,14,0.1)"
      />
      <rect
        x={screenX + 4}
        y={screenY + 21}
        width={screenW - 12}
        height={1.5}
        rx={0.75}
        fill="rgba(14,14,14,0.08)"
      />
      <rect
        x={screenX + 4}
        y={screenY + 28}
        width={screenW - 8}
        height={9}
        rx={3.5}
        fill={VERDAN}
      />
      <text
        x={cx}
        y={screenY + 34.5}
        textAnchor="middle"
        fill="#ffffff"
        style={{ fontSize: 4, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        Open app
      </text>
      <rect
        x={cx - 6}
        y={screenY + screenH - 6}
        width={12}
        height={1.75}
        rx={0.875}
        fill="rgba(14,14,14,0.14)"
      />
    </g>
  );
}

function DeviceViz() {
  const { baseline, laptopW, tabletW, phoneW, laptopTabletGap, tabletPhoneOverlap, viewW } =
    DEVICE_LAYOUT;

  const laptopCx = laptopW / 2;
  const tabletCx = laptopW + laptopTabletGap + tabletW / 2;
  const phoneCx = tabletCx + tabletW / 2 + phoneW / 2 - tabletPhoneOverlap;
  const groupLeft = 0;
  const groupRight = phoneCx + phoneW / 2;
  const groupWidth = groupRight - groupLeft;
  const offsetX = (viewW - groupWidth) / 2;

  return (
    <div className="relative flex h-full min-h-[12rem] w-full items-center justify-center px-2 py-3 md:min-h-[13rem]">
      <svg
        viewBox={`0 0 ${viewW} 148`}
        className="h-auto w-full max-w-[340px]"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${offsetX}, 0)`}>
          <DeviceLaptopMock cx={laptopCx} baseline={baseline} />
          <DeviceTabletMock cx={tabletCx} baseline={baseline} />
          <DevicePhoneMock cx={phoneCx} baseline={baseline} />
        </g>
      </svg>
    </div>
  );
}

const REPORTS_LINE = {
  sourceX: 108,
  bendX: 178,
  endX: 302,
  csvY: 32,
  xlsxY: 100,
  pdfY: 168,
  topY: 72,
  bottomY: 128,
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

function ReportsViz() {
  const { sourceX, bendX, endX, csvY, xlsxY, pdfY, topY, bottomY } =
    REPORTS_LINE;
  const chartBars = [
    { x: 12, h: 22 },
    { x: 24, h: 34 },
    { x: 36, h: 28 },
    { x: 48, h: 40 },
    { x: 60, h: 32 },
  ];
  const chartBaseY = 58;

  return (
    <div className="relative h-52 w-full overflow-hidden px-2 pb-2 pt-2 md:px-3">
      <svg
        viewBox="0 0 400 200"
        className="h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Source: compact bar chart in a box */}
        <g transform="translate(24, 52)">
          <rect
            width="84"
            height="96"
            rx="6"
            fill="white"
            stroke="rgba(14,14,14,0.1)"
          />
          <line
            x1="10"
            y1={chartBaseY}
            x2="74"
            y2={chartBaseY}
            stroke="rgba(14,14,14,0.08)"
            strokeWidth="1"
          />
          {chartBars.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={chartBaseY}
              width="8"
              height="0"
              rx="1.5"
              fill={VERDAN}
              opacity="0.85"
            >
              <animate
                attributeName="height"
                values={`0;${b.h};${b.h};0`}
                keyTimes="0;0.4;0.85;1"
                dur="4.5s"
                begin={`${i * 0.12}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y"
                values={`${chartBaseY};${chartBaseY - b.h};${chartBaseY - b.h};${chartBaseY}`}
                keyTimes="0;0.4;0.85;1"
                dur="4.5s"
                begin={`${i * 0.12}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}
        </g>

        {/* Animated dotted routes */}
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

function uptimeBarColor(index: number) {
  if ([11, 26, 37].includes(index)) return UPTIME_DOWN;
  if ([7, 17, 30, 41].includes(index)) return UPTIME_WARN;
  return VERDAN;
}

function uptimeBarHeight(index: number) {
  if ([11, 26, 37].includes(index)) return 9;
  if ([7, 17, 30, 41].includes(index)) return 11;
  return 14;
}

function UptimeViz() {
  const cardX = 28;
  const cardY = 14;
  const cardW = 224;
  const cardH = 88;
  const barAreaX = cardX + 18;
  const barW = 2.75;
  const barGap = 1.35;
  const barBaseY = cardY + 54;

  return (
    <div className="relative flex h-full min-h-[12rem] w-full items-center justify-center px-2 py-3 md:min-h-[13rem]">
      <svg
        viewBox="0 0 280 116"
        className="h-auto w-full max-w-[300px]"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={cardX + 2}
          y={cardY + 3}
          width={cardW}
          height={cardH}
          rx={14}
          fill={`rgba(${VERDAN_RGB}, 0.06)`}
        />
        <rect
          x={cardX}
          y={cardY}
          width={cardW}
          height={cardH}
          rx={14}
          fill="#ffffff"
          stroke="rgba(14,14,14,0.1)"
          strokeWidth={1.25}
        />
        <text
          x={cardX + 18}
          y={cardY + 26}
          fill="rgba(14,14,14,0.88)"
          style={{ fontSize: 11, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
        >
          Uptime
        </text>
        <text
          x={cardX + cardW - 18}
          y={cardY + 26}
          textAnchor="end"
          fill="rgba(14,14,14,0.88)"
          style={{ fontSize: 11, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
        >
          99.9%
        </text>
        {Array.from({ length: UPTIME_BAR_COUNT }).map((_, i) => {
          const h = uptimeBarHeight(i);
          const x = barAreaX + i * (barW + barGap);
          return (
            <rect
              key={i}
              x={x}
              y={barBaseY - h}
              width={barW}
              height={h}
              rx={barW / 2}
              fill={uptimeBarColor(i)}
              opacity={uptimeBarColor(i) === VERDAN ? 0.82 : 0.92}
            />
          );
        })}
        <text
          x={cardX + 18}
          y={cardY + cardH - 14}
          fill="rgba(14,14,14,0.42)"
          style={{ fontSize: 8.5, fontFamily: "system-ui, sans-serif" }}
        >
          45 days ago
        </text>
        <text
          x={cardX + cardW - 18}
          y={cardY + cardH - 14}
          textAnchor="end"
          fill="rgba(14,14,14,0.42)"
          style={{ fontSize: 8.5, fontFamily: "system-ui, sans-serif" }}
        >
          Today
        </text>
      </svg>
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
          <div onMouseMove={onMove} className="h-full">
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

          <div onMouseMove={onMove} className="h-full">
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
          <div onMouseMove={onMove} className="h-full">
            <SmallFeatureCard
              title="Team administration"
              desc="Assign field teams to specific plantation sites."
              viz={<TeamViz />}
              delay={400}
              inView={gridIn}
            />
          </div>

          <div onMouseMove={onMove} className="h-full">
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
          <div onMouseMove={onMove} className="h-full">
            <SmallFeatureCard
              title="Mobile friendly"
              desc="Built for field teams on any device."
              viz={<DeviceViz />}
              delay={560}
              inView={gridIn}
            />
          </div>

          <div onMouseMove={onMove} className="h-full">
            <SmallFeatureCard
              title="Platform uptime"
              desc="45-day uptime history across all plantation sites."
              descClassName="!text-[13px] !leading-snug md:!text-[14px]"
              viz={<UptimeViz />}
              delay={640}
              inView={gridIn}
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
