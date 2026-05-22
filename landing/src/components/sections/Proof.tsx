"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  MapPin,
  ShieldCheck,
  FileText,
  Quote,
  ArrowRight,
  Sparkles,
  Activity,
  TreePine,
  Camera,
  LineChart,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";

const VERDAN = "#48845c";
const VERDAN_RGB = "72, 132, 92";

/* ---------- hooks ---------- */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
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

function useCountUp(target: number, start: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

/* ---------- formatting ---------- */

function formatMetric(n: number, kind: "compactM" | "compactK" | "int" | "pct") {
  switch (kind) {
    case "compactM":
      return `${(n / 1_000_000).toFixed(n >= 1_000_000 ? 1 : 0)}M`;
    case "compactK":
      return `${Math.round(n / 1000).toLocaleString()}K`;
    case "pct":
      return `${Math.round(n)}%`;
    default:
      return Math.round(n).toLocaleString();
  }
}

/* ---------- 1. Metrics strip ---------- */

type Metric = {
  label: string;
  value: number;
  kind: "compactM" | "compactK" | "int" | "pct";
  suffix?: string;
  icon: ReactNode;
};

const METRICS: Metric[] = [
  { label: "Trees Tracked", value: 1_200_000, kind: "compactM", suffix: "+", icon: <TreePine size={16} /> },
  { label: "GPS Verified Records", value: 48_000, kind: "compactK", suffix: "+", icon: <MapPin size={16} /> },
  { label: "Active Plantation Sites", value: 96, kind: "int", icon: <Activity size={16} /> },
  { label: "Avg Monitoring Compliance", value: 89, kind: "pct", icon: <ShieldCheck size={16} /> },
  { label: "Field Team Members", value: 320, kind: "int", suffix: "+", icon: <Leaf size={16} /> },
  { label: "Plantation Photos Processed", value: 4_600_000, kind: "compactM", suffix: "+", icon: <Camera size={16} /> },
];

function MetricCard({ m, inView, delay }: { m: Metric; inView: boolean; delay: number }) {
  const n = useCountUp(m.value, inView);
  return (
    <div
      className="glass-panel-strong group relative overflow-hidden !rounded-[8px] p-5 transition-all duration-500"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms, box-shadow 300ms ease`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `rgba(${VERDAN_RGB}, 0.25)` }}
      />
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-font)]/50">
        <span
          className="relative flex h-5 w-5 items-center justify-center rounded-full"
          style={{ color: VERDAN, background: `rgba(${VERDAN_RGB}, 0.1)` }}
        >
          {m.icon}
        </span>
        {m.label}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-[34px] font-light leading-none tracking-tight text-[var(--color-font)]">
          {formatMetric(n, m.kind)}
        </span>
        {m.suffix && (
          <span className="text-[20px] font-light text-[var(--color-font)]/50">{m.suffix}</span>
        )}
      </div>
    </div>
  );
}

function MetricsStrip() {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {METRICS.map((m, i) => (
        <MetricCard key={m.label} m={m} inView={inView} delay={i * 70} />
      ))}
    </div>
  );
}

/* ---------- 2. Survival rate block ---------- */

function SurvivalChart({ inView }: { inView: boolean }) {
  // Two animated lines: untracked (flat/declining) vs monitored (rising).
  const W = 520;
  const H = 220;
  const pad = 28;

  const untracked = [62, 58, 54, 51, 48, 46, 44, 42];
  const monitored = [64, 68, 72, 75, 79, 82, 84, 86];

  const toPath = (vals: number[]) => {
    const stepX = (W - pad * 2) / (vals.length - 1);
    return vals
      .map((v, i) => {
        const x = pad + i * stepX;
        const y = H - pad - ((v - 30) / 60) * (H - pad * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <linearGradient id="monitoredFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={VERDAN} stopOpacity="0.35" />
          <stop offset="100%" stopColor={VERDAN} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0, 1, 2, 3].map((i) => {
        const y = pad + ((H - pad * 2) / 3) * i;
        return (
          <line
            key={i}
            x1={pad}
            x2={W - pad}
            y1={y}
            y2={y}
            stroke="rgba(14,14,14,0.06)"
            strokeDasharray="2 4"
          />
        );
      })}
      {/* monitored area */}
      <path
        d={`${toPath(monitored)} L ${W - pad},${H - pad} L ${pad},${H - pad} Z`}
        fill="url(#monitoredFill)"
        opacity={inView ? 1 : 0}
        style={{ transition: "opacity 1200ms ease 600ms" }}
      />
      {/* untracked line */}
      <path
        d={toPath(untracked)}
        fill="none"
        stroke="#c0432e"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="800"
        strokeDashoffset={inView ? 0 : 800}
        style={{ transition: "stroke-dashoffset 1600ms ease-out 200ms" }}
      />
      {/* monitored line */}
      <path
        d={toPath(monitored)}
        fill="none"
        stroke={VERDAN}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="800"
        strokeDashoffset={inView ? 0 : 800}
        style={{ transition: "stroke-dashoffset 1600ms ease-out 500ms" }}
      />
      {/* pulse dots on monitored line */}
      {monitored.map((v, i) => {
        const stepX = (W - pad * 2) / (monitored.length - 1);
        const x = pad + i * stepX;
        const y = H - pad - ((v - 30) / 60) * (H - pad * 2);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill={VERDAN}
            opacity={inView ? 1 : 0}
            style={{ transition: `opacity 400ms ease ${1400 + i * 70}ms` }}
          />
        );
      })}
      {/* legend */}
      <g transform={`translate(${pad}, ${pad - 12})`}>
        <circle cx={4} cy={0} r={3} fill={VERDAN} />
        <text x={12} y={3} style={{ fontSize: 10, fill: "#3a3a3a" }}>
          Monitored sites
        </text>
        <circle cx={130} cy={0} r={3} fill="#c0432e" />
        <text x={138} y={3} style={{ fontSize: 10, fill: "#3a3a3a" }}>
          Untracked
        </text>
      </g>
    </svg>
  );
}

function SurvivalStat({
  value,
  suffix,
  label,
  inView,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  inView: boolean;
  delay: number;
}) {
  const n = useCountUp(value, inView);
  return (
    <div
      className="rounded-[8px] border border-[rgba(14,14,14,0.06)] bg-white/60 p-4 backdrop-blur"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
      }}
    >
      <div className="flex items-baseline gap-1">
        <span
          className="text-[28px] font-light leading-none tracking-tight"
          style={{ color: VERDAN }}
        >
          {Math.round(n)}
        </span>
        <span className="text-[16px] font-light text-[var(--color-font)]/50">{suffix}</span>
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[var(--color-font)]/70">{label}</p>
    </div>
  );
}

function SurvivalBlock() {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
      className="glass-panel-strong !rounded-[8px] p-6 md:p-10"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 800ms ease, transform 800ms ease",
      }}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ background: `rgba(${VERDAN_RGB}, 0.08)`, color: VERDAN }}
          >
            <Sparkles size={11} /> Outcome
          </span>
          <h3 className="mt-4 text-[28px] font-light leading-[1.15] tracking-tight text-[var(--color-font)] md:text-[34px]">
            Monitoring increased plantation survival rates.
          </h3>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--color-font)]/70">
            Organizations using structured monitoring and verification workflows
            reported significantly higher plantation survival consistency
            compared to untracked projects.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <SurvivalStat value={34} suffix="%" label="Increase in monitored survival consistency" inView={inView} delay={150} />
            <SurvivalStat value={61} suffix="%" label="Faster issue detection" inView={inView} delay={250} />
            <SurvivalStat value={4} suffix="×" label="Increase in field visibility" inView={inView} delay={350} />
            <SurvivalStat value={82} suffix="%" label="Verification completion rate" inView={inView} delay={450} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="relative h-[280px] overflow-hidden rounded-[8px] border border-[rgba(14,14,14,0.06)] bg-gradient-to-br from-white/80 to-[rgba(72,132,92,0.04)] p-4">
            <div className="absolute right-4 top-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-font)]/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: VERDAN, opacity: 0.7 }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: VERDAN }} />
              </span>
              Survival rate · 8 quarters
            </div>
            <SurvivalChart inView={inView} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Reports showcase ---------- */

const REPORT_TYPES = [
  { name: "ESG Report Q3", meta: "PDF · 24 pages", badge: "PDF", badgeColor: "#c0432e" },
  { name: "CSR Plantation Summary", meta: "XLSX · 12 sites", badge: "XLSX", badgeColor: "#3a8f53" },
  { name: "Carbon Restoration Log", meta: "CSV · 4.2K rows", badge: "CSV", badgeColor: "#3eb8ad" },
  { name: "Geo-tagged Audit", meta: "GeoJSON · 1.2M pts", badge: "GEO", badgeColor: "#b8861b" },
];

const FLOATING_NOTES = [
  { icon: <CheckCircle2 size={12} />, label: "Export complete" },
  { icon: <ShieldCheck size={12} />, label: "Verified submission" },
  { icon: <MapPin size={12} />, label: "GPS synced" },
  { icon: <FileText size={12} />, label: "Site audit passed" },
];

function ReportsBlock() {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
      className="glass-panel-strong relative !rounded-[8px] p-6 md:p-10"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 800ms ease, transform 800ms ease",
      }}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ background: `rgba(${VERDAN_RGB}, 0.08)`, color: VERDAN }}
          >
            <FileText size={11} /> Reporting
          </span>
          <h3 className="mt-4 text-[28px] font-light leading-[1.15] tracking-tight text-[var(--color-font)] md:text-[34px]">
            Built for reporting, compliance & accountability.
          </h3>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--color-font)]/70">
            Generate transparent plantation reports backed by GPS records,
            timestamps, and field documentation — ready for ESG, CSR and audit
            submissions.
          </p>
          <ul className="mt-6 space-y-2">
            {[
              "Plantation timelines with verified milestones",
              "Geo-tagged exports for every site",
              "Tamper-evident verification logs",
              "Carbon & survival analytics rollups",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-[13px] text-[var(--color-font)]/75">
                <CheckCircle2 size={14} className="mt-[3px] shrink-0" style={{ color: VERDAN }} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Stacked reports */}
        <div className="relative h-[340px]">
          <div className="absolute inset-0 flex items-center justify-center">
            {REPORT_TYPES.map((r, i) => {
              const offset = (i - (REPORT_TYPES.length - 1) / 2) * 16;
              const rotate = (i - (REPORT_TYPES.length - 1) / 2) * 3;
              return (
                <div
                  key={r.name}
                  className="absolute h-[260px] w-[200px] rounded-[10px] border border-[rgba(14,14,14,0.08)] bg-white p-4 shadow-[0_18px_40px_-22px_rgba(14,14,14,0.25)] transition-all duration-500 hover:-translate-y-2"
                  style={{
                    transform: inView
                      ? `translate(${offset}px, ${-Math.abs(offset) * 0.4}px) rotate(${rotate}deg)`
                      : `translate(0,40px) rotate(0deg)`,
                    opacity: inView ? 1 : 0,
                    transitionDelay: `${i * 120}ms`,
                    zIndex: i,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-[4px] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white"
                      style={{ background: r.badgeColor }}
                    >
                      {r.badge}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400">
                      Verified
                    </span>
                  </div>
                  <div className="mt-3 text-[12px] font-medium text-[var(--color-font)]">
                    {r.name}
                  </div>
                  <div className="text-[10px] text-[var(--color-font)]/50">{r.meta}</div>
                  <div className="mt-3 space-y-1.5">
                    {[0.95, 0.8, 0.7, 0.85, 0.6, 0.9, 0.55].map((w, k) => (
                      <div
                        key={k}
                        className="h-1.5 rounded-full bg-gray-100"
                        style={{
                          width: `${w * 100}%`,
                          background: k % 3 === 0 ? `rgba(${VERDAN_RGB},0.18)` : "rgba(14,14,14,0.06)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[9px] text-gray-400">
                    <span>verdan.app</span>
                    <span>p. {i + 1}/24</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating notifications */}
          {FLOATING_NOTES.map((note, i) => {
            const positions = [
              "left-2 top-4",
              "right-2 top-12",
              "left-4 bottom-10",
              "right-4 bottom-4",
            ];
            return (
              <div
                key={note.label}
                className={cn(
                  "absolute z-20 flex items-center gap-1.5 rounded-full border border-[rgba(14,14,14,0.06)] bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[var(--color-font)]/70 shadow-[0_8px_22px_-12px_rgba(14,14,14,0.25)] backdrop-blur",
                  positions[i],
                )}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 600ms ease ${600 + i * 200}ms, transform 600ms ease ${600 + i * 200}ms`,
                  animation: inView ? `proofFloat 5s ease-in-out ${i * 0.6}s infinite` : undefined,
                }}
              >
                <span style={{ color: "var(--verdan-green)" }}>{note.icon}</span>
                {note.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. Testimonials ---------- */

const TESTIMONIALS = [
  {
    quote:
      "Before Verdan, plantation monitoring was fragmented across spreadsheets and field reports. Now every tree is traceable.",
    name: "Sustainability Lead",
    role: "Renewable Energy Company",
    initial: "S",
  },
  {
    quote:
      "Verdan helped us bring accountability and visibility into our restoration projects across multiple sites.",
    name: "Environmental Program Manager",
    role: "Conservation Org",
    initial: "E",
  },
  {
    quote:
      "The GPS verification and photo tracking completely changed how our teams manage plantations.",
    name: "Field Operations Coordinator",
    role: "Afforestation Program",
    initial: "F",
  },
];

function TestimonialsBlock() {
  const { ref, inView } = useInView(0.15);
  return (
    <div ref={ref} className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TESTIMONIALS.map((t, i) => (
        <div
          key={t.name}
          className="glass-panel-strong group relative !rounded-[8px] p-6 transition-all duration-500 hover:-translate-y-1"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 700ms ease ${i * 120}ms, transform 700ms ease ${i * 120}ms, box-shadow 300ms ease`,
            boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              boxShadow: `0 0 0 1px rgba(${VERDAN_RGB}, 0.25), 0 24px 60px -32px rgba(${VERDAN_RGB}, 0.4)`,
            }}
          />
          <Quote size={20} style={{ color: VERDAN }} className="opacity-70" />
          <p className="mt-4 text-[15px] font-light leading-relaxed text-[var(--color-font)]">
            "{t.quote}"
          </p>
          <div className="mt-6 flex items-center gap-3 border-t border-[rgba(14,14,14,0.06)] pt-4">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium text-white"
              style={{ background: `linear-gradient(135deg, ${VERDAN}, #2f6a44)` }}
            >
              {t.initial}
            </div>
            <div>
              <div className="text-[13px] font-medium text-[var(--color-font)]">{t.name}</div>
              <div className="text-[11px] text-[var(--color-font)]/50">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 5. Journey / case study ---------- */

const JOURNEY_STEPS = [
  { icon: <TreePine size={16} />, label: "Trees planted" },
  { icon: <MapPin size={16} />, label: "GPS tagged" },
  { icon: <Camera size={16} />, label: "Photo verified" },
  { icon: <Activity size={16} />, label: "Growth monitored" },
  { icon: <LineChart size={16} />, label: "Analytics generated" },
  { icon: <ShieldCheck size={16} />, label: "Impact measured" },
];

function JourneyBlock() {
  const { ref, inView } = useInView(0.2);
  return (
    <div
      ref={ref}
      className="glass-panel-strong !rounded-[8px] p-6 md:p-10"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 800ms ease, transform 800ms ease",
      }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]"
          style={{ background: `rgba(${VERDAN_RGB}, 0.08)`, color: VERDAN }}
        >
          <Activity size={11} /> Lifecycle
        </span>
        <h3 className="mt-4 text-[28px] font-light leading-[1.15] tracking-tight text-[var(--color-font)] md:text-[34px]">
          From plantation activity to measurable infrastructure.
        </h3>
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-font)]/70">
          Verdan enables organizations to monitor plantations continuously
          instead of treating restoration as a one-time event.
        </p>
      </div>

      <div className="relative mt-10 overflow-x-auto">
        <div className="relative mx-auto flex min-w-[760px] items-start justify-between gap-2 px-4">
          {/* connecting line */}
          <div className="absolute left-[6%] right-[6%] top-[22px] h-px overflow-hidden">
            <div className="h-full w-full" style={{ background: "rgba(14,14,14,0.08)" }} />
            <div
              className="absolute inset-y-0 left-0 h-full"
              style={{
                width: inView ? "100%" : "0%",
                background: `linear-gradient(90deg, transparent, ${VERDAN}, transparent)`,
                transition: "width 2200ms ease-out 200ms",
              }}
            />
          </div>

          {JOURNEY_STEPS.map((s, i) => (
            <div
              key={s.label}
              className="relative flex w-[120px] flex-col items-center text-center"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 500ms ease ${300 + i * 180}ms, transform 500ms ease ${300 + i * 180}ms`,
              }}
            >
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-white"
                style={{
                  borderColor: `rgba(${VERDAN_RGB}, 0.35)`,
                  color: VERDAN,
                  boxShadow: `0 0 0 4px rgba(${VERDAN_RGB}, 0.08)`,
                }}
              >
                {s.icon}
                <span
                  className="absolute inset-0 animate-ping rounded-full"
                  style={{
                    background: `rgba(${VERDAN_RGB}, 0.2)`,
                    animationDuration: "3s",
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              </div>
              <div className="mt-3 text-[11px] font-medium text-[var(--color-font)]">
                {s.label}
              </div>
              {i < JOURNEY_STEPS.length - 1 && (
                <ArrowRight
                  size={12}
                  className="absolute -right-2 top-[16px] text-gray-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 6. Trust / dark block ---------- */

const LIVE_FEED = [
  { t: "12s ago", msg: "Site #042 — 18 new GPS records synced" },
  { t: "47s ago", msg: "Photo verification passed · 312 images" },
  { t: "1m ago", msg: "Growth update logged · Avg height 4.3m" },
  { t: "2m ago", msg: "Audit checkpoint completed · Site #017" },
];

function TrustBlock() {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[12px] p-8 md:p-14"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 0%, rgba(72,132,92,0.35), transparent 60%), radial-gradient(80% 60% at 100% 100%, rgba(72,132,92,0.18), transparent 60%), linear-gradient(180deg, #0e1612 0%, #0a0f0c 100%)",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 900ms ease, transform 900ms ease",
      }}
    >
      {/* ambient particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 31) % 100}%`,
              background: `rgba(${VERDAN_RGB}, ${0.25 + ((i % 5) * 0.1)})`,
              boxShadow: `0 0 12px rgba(${VERDAN_RGB}, 0.6)`,
              animation: `proofParticle ${6 + (i % 5)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/80">
            <Leaf size={11} /> Why it matters
          </span>
          <h3 className="mt-5 text-[32px] font-light leading-[1.1] tracking-tight text-white md:text-[44px]">
            Because planting trees is{" "}
            <span style={{ color: "#9bd3a8" }}>not enough</span> anymore.
          </h3>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
            The future of environmental restoration depends on visibility,
            verification, and measurable long-term impact.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { k: "Live GPS streams", v: "24/7" },
              { k: "Verification SLA", v: "<5m" },
              { k: "Data retention", v: "10yr" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-[8px] border border-white/10 bg-white/5 p-3 backdrop-blur"
              >
                <div className="text-[18px] font-light text-white">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50">
                  {s.k}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* live activity feed */}
        <div className="relative">
          <div className="rounded-[10px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live activity
              </div>
              <span className="text-[10px] text-white/40">verdan ops</span>
            </div>
            <ul className="mt-3 space-y-2.5">
              {LIVE_FEED.map((f, i) => (
                <li
                  key={f.msg}
                  className="flex items-start justify-between gap-3 rounded-md px-2 py-1.5 text-[12px] text-white/85 transition hover:bg-white/5"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateX(0)" : "translateX(8px)",
                    transition: `opacity 500ms ease ${400 + i * 150}ms, transform 500ms ease ${400 + i * 150}ms`,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "#9bd3a8" }}
                    />
                    {f.msg}
                  </span>
                  <span className="shrink-0 text-[10px] text-white/40">{f.t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* floating GPS pin */}
          <div
            className="absolute -right-2 -top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur"
            style={{ animation: "proofFloat 5s ease-in-out infinite" }}
          >
            <MapPin size={11} style={{ color: "#9bd3a8" }} />
            22.5726° N, 88.3639° E
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Section root ---------- */

export default function Proof() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [headVisible, setHeadVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setHeadVisible(true),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="proof"
      ref={sectionRef}
      className="section-noise relative w-full scroll-mt-[4.25rem] overflow-hidden px-6 py-32 text-[var(--color-font)] md:px-12 lg:px-20"
      style={{ background: "var(--background)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(900px 500px at 15% 10%, rgba(${VERDAN_RGB},0.08), transparent 60%),
                            radial-gradient(700px 420px at 85% 85%, rgba(${VERDAN_RGB},0.05), transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div
          className={cn(
            "max-w-3xl transition-all duration-700",
            headVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-[12px] font-medium tracking-wide backdrop-blur",
              headVisible && "hero-animate-fade-slide-up-sm",
            )}
            style={{
              borderColor: "rgba(var(--verdan-green-rgb), 0.25)",
              background: "rgba(var(--verdan-green-rgb), 0.06)",
              color: "var(--verdan-green)",
            }}
          >
            PROOF
          </span>
          <PageHeadline
            line1="Proof that restoration"
            line2="can be measured."
            line2ClassName="text-[var(--verdan-green)]"
            className={cn("mt-5", headVisible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg font-light leading-relaxed text-[var(--color-font)]/70",
              headVisible && "hero-animate-fade-slide-up-sm",
            )}
          >
            Verdan helps organizations transform plantation activities into
            measurable environmental impact — verified, traceable, and
            reportable at scale.
          </p>
        </div>

        <div className="mt-16">
          <MetricsStrip />
        </div>

        <div className="mt-6">
          <SurvivalBlock />
        </div>

        <div className="mt-6">
          <ReportsBlock />
        </div>

        <div className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <h3 className="text-[22px] font-light tracking-tight text-[var(--color-font)] md:text-[26px]">
              Trusted by the teams measuring real restoration.
            </h3>
            <span className="hidden text-[11px] uppercase tracking-[0.16em] text-[var(--color-font)]/50 md:block">
              Operator voices
            </span>
          </div>
          <TestimonialsBlock />
        </div>

        <div className="mt-6">
          <JourneyBlock />
        </div>

        <div className="mt-6">
          <TrustBlock />
        </div>
      </div>
    </section>
  );
}
