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
const ALERT = "#c0432e";

const CHART_HEIGHT = 168;
const LINE_STROKE = 1.25;
const END_DOT_R = 2.5;
const GRID_STROKE = "rgba(14, 14, 14, 0.06)";

const SURVIVAL_DATA = [
  { index: 0, quarter: "Q1", monitored: 64, untracked: 62, activity: 12 },
  { index: 1, quarter: "Q2", monitored: 68, untracked: 58, activity: 15 },
  { index: 2, quarter: "Q3", monitored: 72, untracked: 54, activity: 14 },
  { index: 3, quarter: "Q4", monitored: 75, untracked: 51, activity: 18 },
  { index: 4, quarter: "Q5", monitored: 79, untracked: 48, activity: 16 },
  { index: 5, quarter: "Q6", monitored: 82, untracked: 46, activity: 20 },
  { index: 6, quarter: "Q7", monitored: 84, untracked: 44, activity: 17 },
  { index: 7, quarter: "Q8", monitored: 86, untracked: 42, activity: 22 },
];

const LAST_INDEX = SURVIVAL_DATA.length - 1;

function endPointDot(color: string) {
  function SurvivalEndPointDot(props: {
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
  SurvivalEndPointDot.displayName = "SurvivalEndPointDot";
  return SurvivalEndPointDot;
}

function SurvivalTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string | number;
    value?: unknown;
    color?: string;
    dataKey?: unknown;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const lines = payload.filter(
    (e) =>
      e.dataKey !== "activity" &&
      e.value != null &&
      (e.dataKey === "monitored" || e.dataKey === "untracked"),
  );

  const seen = new Set<string>();

  return (
    <div className="rounded-[6px] border border-[rgba(14,14,14,0.08)] bg-white/95 px-2.5 py-2 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.1)]">
      {label && (
        <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wide text-[var(--color-font)]/45">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {lines.map((entry, index) => {
          const raw = entry.value;
          const value = typeof raw === "number" ? raw : Number(raw);
          if (Number.isNaN(value)) return null;
          const dataKey = String(entry.dataKey);
          if (seen.has(dataKey)) return null;
          seen.add(dataKey);
          const name =
            dataKey === "monitored" ? "Monitored sites" : "Untracked";
          return (
            <li
              key={`${dataKey}-${index}`}
              className="flex items-center justify-between gap-4 text-[10px]"
            >
              <span className="inline-flex items-center gap-1.5 text-[var(--color-font)]/55">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: entry.color }}
                />
                {name}
              </span>
              <span className="tabular-nums text-[var(--color-font)]">
                {Math.round(value)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const SERIES = [
  { id: "monitored", label: "Monitored sites", color: VERDAN, area: true },
  { id: "untracked", label: "Untracked", color: ALERT, area: false },
] as const;

export function SurvivalRateChart({ animate = false }: { animate?: boolean }) {
  return (
    <div className="relative mx-auto w-full px-1 py-3">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart
          data={SURVIVAL_DATA}
          margin={{ top: 10, right: 8, left: 8, bottom: 6 }}
        >
          <CartesianGrid
            stroke={GRID_STROKE}
            horizontal={false}
            vertical
            strokeDasharray="none"
          />
          <XAxis dataKey="index" hide />
          <YAxis yAxisId="rate" hide domain={[38, 90]} />
          <YAxis yAxisId="activity" hide domain={[0, 28]} />

          <Tooltip
            content={(props) => (
              <SurvivalTooltip
                active={props.active}
                payload={props.payload}
                label={
                  typeof props.label === "number"
                    ? SURVIVAL_DATA[props.label]?.quarter
                    : undefined
                }
              />
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
            yAxisId="rate"
            type="monotone"
            dataKey="monitored"
            stroke="none"
            fill={`rgba(${VERDAN_RGB}, 0.14)`}
            isAnimationActive={animate}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {SERIES.map((series, index) => (
            <Line
              key={animate ? `${series.id}-in` : `${series.id}-out`}
              yAxisId="rate"
              type="linear"
              dataKey={series.id}
              name={series.label}
              stroke={series.color}
              strokeWidth={LINE_STROKE}
              dot={endPointDot(series.color)}
              activeDot={{ r: 3.5, strokeWidth: 0, fill: series.color }}
              isAnimationActive={animate}
              animationDuration={1100}
              animationBegin={index * 80}
              animationEasing="ease-out"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {SERIES.map((series) => (
          <span
            key={series.id}
            className="inline-flex items-center gap-1.5 text-[9px] font-light text-[var(--color-font)]/45"
          >
            <span
              className="h-1 w-3 rounded-full"
              style={{ background: series.color }}
            />
            {series.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[9px] font-light text-[var(--color-font)]/45">
          <span
            className="h-2 w-1 rounded-[1px]"
            style={{ background: `rgba(${VERDAN_RGB}, 0.35)` }}
          />
          Field activity
        </span>
      </div>
    </div>
  );
}
