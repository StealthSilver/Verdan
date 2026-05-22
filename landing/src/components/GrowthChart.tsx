"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const VERDAN = "#48845c";
const VERDAN_RGB = "72, 132, 92";
const ACCENT = "#cd934d";
const MUTED_LINE = "rgba(14, 14, 14, 0.28)";

const POINT_COUNT = 28;

/** Per-tree normal CDF params (μ, σ) + display color — sigmoid growth curves */
const TREES = [
  { id: "T-014", color: VERDAN, mu: 0.44, sigma: 0.14, min: 32, max: 430, area: true },
  { id: "T-027", color: ACCENT, mu: 0.4, sigma: 0.13, min: 38, max: 448, area: false },
  { id: "T-031", color: "#3d7350", mu: 0.48, sigma: 0.15, min: 28, max: 405, area: false },
  { id: "T-052", color: "#6b8f72", mu: 0.42, sigma: 0.12, min: 40, max: 455, area: false },
  { id: "T-068", color: MUTED_LINE, mu: 0.46, sigma: 0.16, min: 30, max: 418, area: false },
  { id: "T-091", color: "#9aaea0", mu: 0.43, sigma: 0.14, min: 35, max: 438, area: false },
] as const;

/** Deterministic noise in [-1, 1] for organic jitter */
function seededNoise(seedA: number, seedB: number) {
  const x = Math.sin(seedA * 12.9898 + seedB * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

function normalCdf(t: number, mu: number, sigma: number) {
  return 0.5 * (1 + erf((t - mu) / (sigma * Math.sqrt(2))));
}

function buildChartData() {
  return Array.from({ length: POINT_COUNT }, (_, i) => {
    const t = i / (POINT_COUNT - 1);
    const row: Record<string, number> = {
      index: i,
      activity: Math.round(
        6 + Math.abs(seededNoise(7, i)) * 18 + Math.abs(seededNoise(3, i * 2)) * 10,
      ),
    };

    TREES.forEach((tree, treeIndex) => {
      const cdf = normalCdf(t, tree.mu, tree.sigma);
      const jitter = seededNoise(treeIndex + 1, i) * 0.035;
      const normalized = Math.min(1, Math.max(0, cdf + jitter));
      row[tree.id] = Math.round(tree.min + (tree.max - tree.min) * normalized);
    });

    return row;
  });
}

const CHART_DATA = buildChartData();
const LAST_INDEX = CHART_DATA.length - 1;

const CHART_HEIGHT = 148;
const LINE_STROKE = 1.25;
const END_DOT_R = 2.5;
const GRID_STROKE = "rgba(14, 14, 14, 0.06)";

function formatHeight(v: number) {
  return v >= 100 ? `${(v / 100).toFixed(1)} m` : `${v} cm`;
}

function endPointDot(color: string) {
  function GrowthChartEndPointDot(props: {
    cx?: number;
    cy?: number;
    index?: number;
  }) {
    const { cx, cy, index } = props;
    if (cx == null || cy == null || index !== LAST_INDEX) return <g />;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={END_DOT_R}
        fill={color}
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={1}
      />
    );
  }
  GrowthChartEndPointDot.displayName = "GrowthChartEndPointDot";
  return GrowthChartEndPointDot;
}

function MultiTreeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string | number;
    value?: unknown;
    color?: string;
    dataKey?: unknown;
  }>;
}) {
  if (!active || !payload?.length) return null;

  const seen = new Set<string>();
  const lines = payload.filter((e) => {
    if (e.dataKey === "activity" || e.value == null) return false;
    const key = String(e.dataKey);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="rounded-[6px] border border-[rgba(14,14,14,0.08)] bg-white/95 px-2.5 py-2 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.1)]">
      <ul className="space-y-0.5">
        {lines.map((entry) => {
          const raw = entry.value;
          const value = typeof raw === "number" ? raw : Number(raw);
          if (Number.isNaN(value)) return null;
          return (
            <li
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-4 text-[10px]"
            >
              <span className="inline-flex items-center gap-1.5 text-[var(--color-font)]/55">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: entry.color }}
                />
                {String(entry.name ?? entry.dataKey)}
              </span>
              <span className="tabular-nums text-[var(--color-font)]">
                {formatHeight(value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GrowthChart({ animate = false }: { animate?: boolean }) {
  const primaryTree = TREES.find((t) => t.area)!;

  return (
    <div className="relative mx-auto w-full max-w-[min(100%,480px)] px-1 py-3">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart
          data={CHART_DATA}
          margin={{ top: 10, right: 8, left: 8, bottom: 6 }}
        >
          <CartesianGrid
            stroke={GRID_STROKE}
            horizontal={false}
            vertical
            strokeDasharray="none"
          />
          <XAxis dataKey="index" hide />
          <YAxis yAxisId="growth" hide domain={["dataMin - 8", "dataMax + 8"]} />
          <YAxis yAxisId="activity" hide domain={[0, 40]} />

          <Tooltip
            content={(props) => (
              <MultiTreeTooltip active={props.active} payload={props.payload} />
            )}
            cursor={{
              stroke: "rgba(14, 14, 14, 0.06)",
              strokeWidth: 1,
            }}
          />

          <Bar
            yAxisId="activity"
            dataKey="activity"
            fill={`rgba(${VERDAN_RGB}, 0.28)`}
            barSize={3}
            radius={[1, 1, 0, 0]}
            isAnimationActive={animate}
            animationDuration={700}
            animationEasing="ease-out"
          />

          <Area
            yAxisId="growth"
            type="monotone"
            dataKey={primaryTree.id}
            stroke="none"
            fill={`rgba(${VERDAN_RGB}, 0.14)`}
            isAnimationActive={animate}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {TREES.map((tree, index) => (
            <Line
              key={animate ? `${tree.id}-in` : `${tree.id}-out`}
              yAxisId="growth"
              type="linear"
              dataKey={tree.id}
              name={tree.id}
              stroke={tree.color}
              strokeWidth={LINE_STROKE}
              dot={endPointDot(tree.color)}
              activeDot={false}
              isAnimationActive={animate}
              animationDuration={1100}
              animationBegin={index * 80}
              animationEasing="ease-out"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Milestone markers (reference-style diamonds below axis) */}
      <div
        className="pointer-events-none absolute bottom-[18px] left-[18%] h-1.5 w-1.5 rotate-45 border border-[rgba(14,14,14,0.2)] bg-white"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[18px] left-[62%] h-1.5 w-1.5 rotate-45 border border-[rgba(14,14,14,0.2)] bg-white"
        aria-hidden
      />

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {TREES.map((tree) => (
          <span
            key={tree.id}
            className="inline-flex items-center gap-1 text-[8px] font-light text-[var(--color-font)]/45"
          >
            <span
              className="h-1 w-3 rounded-full"
              style={{ background: tree.color }}
            />
            {tree.id}
          </span>
        ))}
      </div>
    </div>
  );
}
