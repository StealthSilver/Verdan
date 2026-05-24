"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { IconChartLine, IconDots, IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const VERDAN = "#48845c";
const VERDAN_RGB = "72, 132, 92";
const TRACKING = "#6b9a76";
const SCOPE = "rgba(14, 14, 14, 0.28)";
const CARD_WIDTH = 340;
/** Horizontal gap between stacked cards — ~42% of card width keeps each quarter readable */
const STACK_OFFSET = 142;
const CHART_H = 142;

type QuarterPoint = {
  i: number;
  scope: number;
  tracking: number;
  verified: number;
  activity: number;
};

type QuarterCard = {
  id: string;
  title: string;
  scope: { value: number; change: string };
  tracking: { value: number; pct: string };
  verified: { value: number; pct: string };
  xStart: string;
  xEnd: string;
  points: QuarterPoint[];
};

function buildPoints(seed: number, scopeEnd: number, trackEnd: number, verifiedEnd: number): QuarterPoint[] {
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const ramp = 1 / (1 + Math.exp(-8 * (t - 0.42 + seed * 0.02)));
    const scope = 38 + scopeEnd * ramp + (i > 5 ? scopeEnd * 0.08 : 0);
    const tracking = 18 + trackEnd * ramp * 0.92 + Math.sin(i * 0.9 + seed) * 2;
    const verified = 12 + verifiedEnd * ramp * 0.88 + Math.sin(i * 0.7 + seed * 1.3) * 1.5;
    const activity = Math.round(
      6 + Math.abs(Math.sin(i * 1.1 + seed)) * 12 + (i % 2) * 4,
    );
    return {
      i,
      scope: Math.round(Math.min(98, scope)),
      tracking: Math.round(Math.min(90, tracking)),
      verified: Math.round(Math.min(85, verified)),
      activity,
    };
  });
}

const QUARTERS: QuarterCard[] = [
  {
    id: "q1",
    title: "Q1 2025",
    scope: { value: 24, change: "+18%" },
    tracking: { value: 9, pct: "38%" },
    verified: { value: 14, pct: "58%" },
    xStart: "Jan",
    xEnd: "Mar",
    points: buildPoints(1, 42, 38, 34),
  },
  {
    id: "q2",
    title: "Q2 2025",
    scope: { value: 28, change: "+42%" },
    tracking: { value: 12, pct: "43%" },
    verified: { value: 19, pct: "68%" },
    xStart: "Apr",
    xEnd: "Jun",
    points: buildPoints(2, 52, 48, 44),
  },
  {
    id: "q3",
    title: "Q3 2025",
    scope: { value: 32, change: "+53%" },
    tracking: { value: 16, pct: "50%" },
    verified: { value: 25, pct: "78%" },
    xStart: "Jul",
    xEnd: "Sep",
    points: buildPoints(3, 58, 55, 52),
  },
];

function EndDot({ color }: { color: string }) {
  function Dot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props;
    if (cx == null || cy == null || index !== 7) return <g />;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={color}
        stroke="#fff"
        strokeWidth={1.25}
      />
    );
  }
  Dot.displayName = "QuarterEndDot";
  return Dot;
}

function MetricColumn({
  label,
  value,
  sub,
  subClass,
  swatch,
}: {
  label: string;
  value: number;
  sub: string;
  subClass?: string;
  swatch: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-[2px]"
          style={{ background: swatch }}
        />
        <span className="text-[10px] text-[var(--color-font)]/45">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[24px] font-medium leading-none tracking-tight text-[var(--color-font)] tabular-nums">
          {value}
        </span>
        <span
          className={cn(
            "text-[11px] font-medium tabular-nums",
            subClass ?? "text-[var(--color-font)]/40",
          )}
        >
          {sub}
        </span>
      </div>
    </div>
  );
}

function QuarterMiniChart({
  data,
  xStart,
  xEnd,
  animate,
}: {
  data: QuarterPoint[];
  xStart: string;
  xEnd: string;
  animate: boolean;
}) {
  return (
    <div className="relative mt-1">
      <ResponsiveContainer width="100%" height={CHART_H}>
        <ComposedChart
          data={data}
          margin={{ top: 6, right: 4, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            stroke="rgba(14, 14, 14, 0.05)"
            horizontal={false}
            vertical
          />
          <XAxis dataKey="i" hide />
          <YAxis yAxisId="rate" hide domain={[10, 100]} />
          <YAxis yAxisId="bars" hide domain={[0, 28]} />

          <Bar
            yAxisId="bars"
            dataKey="activity"
            fill={`rgba(${VERDAN_RGB}, 0.32)`}
            barSize={4}
            radius={[1, 1, 0, 0]}
            isAnimationActive={animate}
            animationDuration={800}
          />

          <Area
            yAxisId="rate"
            type="monotone"
            dataKey="verified"
            stroke="none"
            fill={`rgba(${VERDAN_RGB}, 0.16)`}
            isAnimationActive={animate}
            animationDuration={900}
          />

          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="scope"
            stroke={SCOPE}
            strokeWidth={1.25}
            dot={false}
            isAnimationActive={animate}
            animationDuration={1000}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="tracking"
            stroke={TRACKING}
            strokeWidth={1.5}
            dot={EndDot({ color: TRACKING })}
            isAnimationActive={animate}
            animationDuration={1000}
            animationBegin={60}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="verified"
            stroke={VERDAN}
            strokeWidth={1.5}
            dot={EndDot({ color: VERDAN })}
            isAnimationActive={animate}
            animationDuration={1000}
            animationBegin={120}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Current point + projected hatch (matches reference layout) */}
      <div
        className="pointer-events-none absolute bottom-[24px] top-[8px] w-px bg-[rgba(14,14,14,0.14)]"
        style={{ left: "72%" }}
        aria-hidden
      />
      <div
        className="quarter-chart-hatch pointer-events-none absolute bottom-[24px] top-[8px] rounded-r-[4px]"
        style={{ left: "72%", right: 0 }}
        aria-hidden
      />
      <div className="mt-0.5 flex justify-between px-0.5 text-[9px] text-[var(--color-font)]/35">
        <span>{xStart}</span>
        <span>{xEnd}</span>
      </div>
    </div>
  );
}

function MonitoringCard({
  card,
  stackIndex,
  isFront,
  animate,
  layout = "desktop",
}: {
  card: QuarterCard;
  stackIndex: number;
  isFront: boolean;
  animate: boolean;
  layout?: "desktop" | "mobile";
}) {
  const isMobile = layout === "mobile";
  const offsetX = stackIndex * STACK_OFFSET;
  const offsetY = (2 - stackIndex) * 3;

  return (
    <article
      className={cn(
        "quarter-monitoring-card rounded-[10px] border border-[rgba(14,14,14,0.08)] bg-white p-4 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.14)] sm:p-5",
        isMobile
          ? "relative w-full"
          : cn(
              "absolute transition-[transform,opacity,box-shadow] duration-500",
              isFront && "z-30 shadow-[0_16px_40px_-14px_rgba(0,0,0,0.18)]",
              stackIndex === 1 && "z-20",
              stackIndex === 0 && "z-10",
              !isFront && "pointer-events-none",
            ),
      )}
      style={
        isMobile
          ? undefined
          : {
              left: offsetX,
              top: offsetY,
              width: CARD_WIDTH,
              maxWidth: "100%",
              opacity: isFront ? 1 : 0.94,
            }
      }
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(14,14,14,0.08)] bg-[rgba(14,14,14,0.03)]">
            <IconChartLine
              size={12}
              stroke={1.5}
              className="text-[var(--color-font)]/50"
              aria-hidden
            />
          </span>
          <h4 className="truncate text-[14px] font-medium text-[var(--color-font)]">
            {card.title}
          </h4>
        </div>
        {(isFront || isMobile) && (
          <div className="flex shrink-0 items-center gap-1.5 text-[var(--color-font)]/35">
            <IconStar size={14} stroke={1.5} aria-hidden />
            <IconDots size={14} stroke={1.5} aria-hidden />
          </div>
        )}
      </header>

      <div className="mt-3 flex gap-2 border-b border-[rgba(14,14,14,0.06)] pb-3">
        <MetricColumn
          label="Sites"
          value={card.scope.value}
          sub={card.scope.change}
          subClass="text-[var(--verdan-green)]"
          swatch="rgba(14, 14, 14, 0.22)"
        />
        <MetricColumn
          label="Tracking"
          value={card.tracking.value}
          sub={card.tracking.pct}
          swatch={TRACKING}
        />
        <MetricColumn
          label="Verified"
          value={card.verified.value}
          sub={card.verified.pct}
          swatch={VERDAN}
        />
      </div>

      <QuarterMiniChart
        data={card.points}
        xStart={card.xStart}
        xEnd={card.xEnd}
        animate={animate}
      />
    </article>
  );
}

const STACK_WIDTH =
  CARD_WIDTH + STACK_OFFSET * (QUARTERS.length - 1);

function ChartLegend() {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      <span className="inline-flex items-center gap-1.5 text-[9px] text-[var(--color-font)]/45">
        <span className="h-2 w-2 rounded-[2px] bg-[rgba(14,14,14,0.22)]" />
        Sites in scope
      </span>
      <span className="inline-flex items-center gap-1.5 text-[9px] text-[var(--color-font)]/45">
        <span className="h-2 w-2 rounded-[2px]" style={{ background: TRACKING }} />
        Active tracking
      </span>
      <span className="inline-flex items-center gap-1.5 text-[9px] text-[var(--color-font)]/45">
        <span className="h-2 w-2 rounded-[2px]" style={{ background: VERDAN }} />
        Verified monitoring
      </span>
      <span className="inline-flex items-center gap-1.5 text-[9px] text-[var(--color-font)]/45">
        <span
          className="h-2 w-1 rounded-[1px]"
          style={{ background: `rgba(${VERDAN_RGB}, 0.35)` }}
        />
        Field checks
      </span>
    </div>
  );
}

export function QuarterMonitoringStack({ animate = false }: { animate?: boolean }) {
  return (
    <>
      {/* Mobile — full-width cards stacked vertically (no horizontal scroll) */}
      <div className="flex w-full flex-col gap-4 md:hidden">
        {QUARTERS.map((card, i) => (
          <MonitoringCard
            key={card.id}
            card={card}
            stackIndex={i}
            isFront
            animate={animate}
            layout="mobile"
          />
        ))}
        <ChartLegend />
      </div>

      {/* Desktop — overlapping horizontal stack (unchanged) */}
      <div className="relative mx-auto hidden w-full max-w-[920px] overflow-x-auto pb-1 md:block">
        <div
          className="relative mx-auto overflow-visible"
          style={{
            height: 318,
            width: STACK_WIDTH,
            minWidth: STACK_WIDTH,
          }}
        >
          {QUARTERS.map((card, i) => (
            <MonitoringCard
              key={card.id}
              card={card}
              stackIndex={i}
              isFront={i === QUARTERS.length - 1}
              animate={animate}
              layout="desktop"
            />
          ))}
        </div>
        <ChartLegend />
      </div>
    </>
  );
}
