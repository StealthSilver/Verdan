"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconCamera,
  IconChartLine,
  IconMapPin,
  IconPlant2,
  IconShieldCheck,
  IconTree,
  IconUsers,
} from "@tabler/icons-react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AccountabilityBlock from "@/components/sections/AccountabilityBlock";
import { JourneyDotTrack } from "@/components/sections/JourneyDotTrack";
import { ReportVerificationFeed } from "@/components/sections/ReportVerificationFeed";
import { QuarterMonitoringStack } from "@/components/QuarterMonitoringStack";
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
      ([e]) => setInView(e.isIntersecting),
      { threshold, rootMargin: "0px 0px -5% 0px" },
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

type MetricIcon = typeof IconTree;

type Metric = {
  label: string;
  value: number;
  kind: "compactM" | "compactK" | "int" | "pct";
  suffix?: string;
  Icon: MetricIcon;
};

const METRICS: Metric[] = [
  { label: "Trees Tracked", value: 1_200_000, kind: "compactM", suffix: "+", Icon: IconTree },
  { label: "GPS Verified Records", value: 48_000, kind: "compactK", suffix: "+", Icon: IconMapPin },
  { label: "Active Plantation Sites", value: 96, kind: "int", Icon: IconPlant2 },
  { label: "Avg Monitoring Compliance", value: 89, kind: "pct", Icon: IconShieldCheck },
  { label: "Field Team Members", value: 320, kind: "int", suffix: "+", Icon: IconUsers },
  { label: "Plantation Photos Processed", value: 4_600_000, kind: "compactM", suffix: "+", Icon: IconCamera },
];

function MetricCard({ m, inView, delay }: { m: Metric; inView: boolean; delay: number }) {
  const n = useCountUp(m.value, inView);
  const Icon = m.Icon;

  return (
    <div
      className="flex flex-col rounded-[8px] border border-[rgba(14,14,14,0.08)] bg-white p-5"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
      }}
    >
      <div
        className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]"
        style={{
          color: VERDAN,
          background: `rgba(${VERDAN_RGB}, 0.08)`,
        }}
      >
        <Icon size={22} stroke={1.5} aria-hidden />
      </div>
      <p className="line-clamp-2 min-h-[2.6rem] text-[13px] font-medium leading-snug text-[var(--color-font)]/55">
        {m.label}
      </p>
      <div className="mt-2 flex items-baseline gap-0.5">
        <span className="text-[42px] font-light leading-none tracking-tight text-[var(--color-font)] md:text-[46px]">
          {formatMetric(n, m.kind)}
        </span>
        {m.suffix && (
          <span className="text-[24px] font-light text-[var(--color-font)]/45 md:text-[26px]">
            {m.suffix}
          </span>
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
          <h3 className="text-[28px] font-light leading-[1.15] tracking-tight text-[var(--color-font)] md:text-[34px]">
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
          <div className="flex w-full flex-col items-stretch px-0 pb-2 pt-2 md:items-center md:px-1">
            <p className="mb-3 text-center text-[11px] font-light tracking-wide text-[var(--color-font)]/50">
              Site monitoring &amp; tracking comparison
              <span className="mx-2 text-[var(--color-font)]/25">·</span>
              <span className="font-normal tabular-nums text-[var(--color-font)]/80">
                Q1–Q3 2025
              </span>
            </p>
            <QuarterMonitoringStack animate={inView} />
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
] as const;

function ReportsStack({ inView }: { inView: boolean }) {
  return (
    <div className="relative mx-auto h-[340px] w-[260px] shrink-0 sm:mx-0">
      <div className="absolute inset-0 flex items-center justify-center">
        {REPORT_TYPES.map((r, i) => {
          const offset = (i - (REPORT_TYPES.length - 1) / 2) * 18;
          const rotate = (i - (REPORT_TYPES.length - 1) / 2) * 3;
          return (
            <div
              key={r.name}
              className="absolute h-[290px] w-[228px] rounded-[10px] border border-[rgba(14,14,14,0.08)] bg-white p-5 shadow-[0_18px_40px_-22px_rgba(14,14,14,0.25)] transition-all duration-500"
              style={{
                transform: inView
                  ? `translate(${offset}px, ${-Math.abs(offset) * 0.35}px) rotate(${rotate}deg)`
                  : "translate(0, 36px) rotate(0deg)",
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
                <span className="text-[9px] uppercase tracking-wider text-[var(--color-font)]/40">
                  Verified
                </span>
              </div>
              <div className="mt-3.5 text-[13px] font-medium text-[var(--color-font)]">
                {r.name}
              </div>
              <div className="text-[11px] text-[var(--color-font)]/50">{r.meta}</div>
              <div className="mt-4 space-y-1.5">
                {[0.95, 0.8, 0.7, 0.85, 0.6, 0.9, 0.55].map((w, k) => (
                  <div
                    key={k}
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${w * 100}%`,
                      background:
                        k % 3 === 0
                          ? `rgba(${VERDAN_RGB}, 0.18)`
                          : "rgba(14,14,14, 0.06)",
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[9px] text-[var(--color-font)]/40">
                <span>harit.app</span>
                <span>p. {i + 1}/24</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
          <h3 className="text-[28px] font-light leading-[1.15] tracking-tight text-[var(--color-font)] md:text-[34px]">
            Built for reporting, compliance & accountability.
          </h3>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--color-font)]/70">
            Generate transparent plantation reports backed by GPS records,
            timestamps, and field documentation, ready for ESG, CSR and audit
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

        <div className="flex min-h-[380px] flex-col items-center justify-center gap-12 sm:flex-row sm:items-center sm:justify-center sm:gap-14 lg:justify-end lg:gap-20">
          <ReportsStack inView={inView} />
          <ReportVerificationFeed active={inView} />
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. Journey / case study ---------- */

type JourneyIcon = typeof IconTree;

const JOURNEY_STEPS: { label: string; Icon: JourneyIcon }[] = [
  { label: "Trees planted", Icon: IconTree },
  { label: "GPS tagged", Icon: IconMapPin },
  { label: "Photo verified", Icon: IconCamera },
  { label: "Growth monitored", Icon: IconPlant2 },
  { label: "Analytics generated", Icon: IconChartLine },
  { label: "Impact measured", Icon: IconShieldCheck },
];

function JourneyBlock() {
  const { ref, inView } = useInView(0.08);

  return (
    <div
      className="glass-panel-strong !rounded-[8px] p-6 md:p-10"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 800ms ease, transform 800ms ease",
      }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-[28px] font-light leading-[1.15] tracking-tight text-[var(--color-font)] md:text-[34px]">
          From plantation activity to measurable infrastructure.
        </h3>
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-font)]/70">
          Harit enables organizations to monitor plantations continuously
          instead of treating restoration as a one-time event.
        </p>
      </div>

      <div
        ref={ref}
        className="relative mt-12 overflow-x-auto py-10 md:py-12"
      >
        <div className="journey-timeline relative mx-auto flex min-w-[760px] items-start justify-between gap-3 px-4">
          <JourneyDotTrack active={inView} />

          {JOURNEY_STEPS.map((s, i) => {
            const StepIcon = s.Icon;
            return (
              <div
                key={s.label}
                className="relative z-10 flex w-[124px] flex-col items-center px-1 pb-2 pt-1 text-center"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 500ms ease ${300 + i * 180}ms, transform 500ms ease ${300 + i * 180}ms`,
                }}
              >
                <div className="journey-step-icon-wrap">
                  <div
                    className={cn(
                      "journey-step-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2",
                      inView && "journey-step-icon--animating",
                    )}
                    style={{
                      color: VERDAN,
                      ["--journey-step" as string]: String(i),
                    }}
                  >
                    <StepIcon size={20} stroke={1.5} aria-hidden />
                  </div>
                </div>
                <div className="relative z-10 mt-4 text-[11px] font-medium leading-snug text-[var(--color-font)]">
                  {s.label}
                </div>
              </div>
            );
          })}
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
      className="section-noise relative w-full scroll-mt-[4.25rem] overflow-hidden px-6 pt-32 pb-16 text-[var(--color-font)] md:px-12 md:pb-20 lg:px-20"
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
          <PageHeadline
            line1="Proof that restoration"
            line2="can be measured."
            line2ClassName="text-[var(--color-font)]"
            className={cn(headVisible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg font-light leading-relaxed text-[var(--color-font)]/70",
              headVisible && "hero-animate-fade-slide-up-sm",
            )}
          >
            Harit helps organizations transform plantation activities into
            measurable environmental impact, verified, traceable, and
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

        <div className="mt-6">
          <JourneyBlock />
        </div>

        <div className="mt-6">
          <AccountabilityBlock />
        </div>
      </div>
    </section>
  );
}
