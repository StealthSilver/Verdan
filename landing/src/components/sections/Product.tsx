"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  Leaf,
  MapPin,
  Search,
  Signal,
  TreePine,
  Upload,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";

const VERDAN = "#48845c";
const VERDAN_DEEP = "#2f5b3f";
const VERDAN_RGB = "72, 132, 92";

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

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return v;
}

function BlockHeader({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets?: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-normal leading-snug tracking-tight text-[var(--color-font)] md:text-2xl">
        {title}
      </h3>
      <p className="max-w-[46ch] text-[15px] font-light leading-relaxed text-[var(--color-font)]/70">
        {desc}
      </p>
      {bullets && (
        <ul className="mt-1 flex flex-col gap-2.5">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2.5 text-[14px] font-light text-[var(--color-font)]/85"
            >
              <span
                className="mt-[3px] inline-flex h-4 w-4 flex-none items-center justify-center rounded-full"
                style={{
                  background: `rgba(${VERDAN_RGB}, 0.1)`,
                  color: "var(--verdan-green)",
                }}
              >
                <Check size={11} strokeWidth={2.6} />
              </span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Panel({
  children,
  className,
  inView,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  inView: boolean;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "glass-panel-strong group relative overflow-hidden !rounded-[8px] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(var(--verdan-green-rgb),0.28)]",
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px 260px at 50% 0%, rgba(${VERDAN_RGB},0.1), transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function DashboardMock({ inView }: { inView: boolean }) {
  const trees = useCountUp(48213, inView, 1800);
  const sites = useCountUp(127, inView, 1400);
  const online = useCountUp(34, inView, 1200);
  const survival = useCountUp(86.4, inView, 1600);

  const stats = [
    { label: "Total Trees", value: Math.round(trees).toLocaleString(), delta: "+2,140" },
    { label: "Active Sites", value: Math.round(sites).toString(), delta: "+6" },
    { label: "Online Members", value: Math.round(online).toString(), delta: "live" },
    { label: "Survival Rate", value: `${survival.toFixed(1)}%`, delta: "+1.8%" },
  ];

  const activity = [
    { who: "Aarav · North Range", what: "Verified 42 saplings", t: "2m" },
    { who: "Site #08 · Drone", what: "New canopy scan uploaded", t: "6m" },
    { who: "Priya · East Block", what: "Created 18 tree profiles", t: "11m" },
    { who: "System", what: "Monthly survival report ready", t: "21m" },
  ];

  const bars = [38, 52, 44, 64, 58, 72, 66, 80, 74, 88, 82, 94];

  return (
    <div className="p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: "var(--verdan-green)", color: "white" }}
          >
            <Leaf size={15} />
          </div>
          <div className="text-[13px] font-medium text-[var(--color-font)]">
            Verdan · Overview
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-md border border-black/5 px-2 py-1 text-[11px] text-[var(--color-font)]/55 sm:flex">
            <Search size={11} /> Search sites
          </div>
          <div
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
            style={{
              background: `rgba(${VERDAN_RGB}, 0.08)`,
              color: "var(--verdan-green)",
            }}
          >
            <span className="hero-live-dot">
              <span className="hero-live-dot__ripple" />
              <span className="hero-live-dot__core" />
            </span>
            Live
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-lg border border-black/5 bg-white/70 p-3"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="text-[10.5px] uppercase tracking-wider text-[var(--color-font)]/45">
              {s.label}
            </div>
            <div className="mt-1 text-[20px] font-light tabular-nums text-[var(--color-font)]">
              {s.value}
            </div>
            <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--verdan-green)" }}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-lg border border-black/5 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-medium text-[var(--color-font)]">
              Monthly Plantation Activity
            </div>
            <div className="text-[10.5px] text-[var(--color-font)]/45">Last 12 months</div>
          </div>
          <svg viewBox="0 0 360 140" className="mt-3 w-full">
            <defs>
              <linearGradient id="productAreaG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={VERDAN} stopOpacity="0.35" />
                <stop offset="100%" stopColor={VERDAN} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                x2="360"
                y1={20 + i * 30}
                y2={20 + i * 30}
                stroke="rgba(0,0,0,0.06)"
              />
            ))}
            {bars.map((h, i) => {
              const x = 10 + i * 29;
              const targetH = inView ? h : 0;
              return (
                <rect
                  key={i}
                  x={x}
                  y={130 - targetH}
                  width={14}
                  height={targetH}
                  rx={3}
                  fill={VERDAN}
                  opacity={0.85}
                  style={{
                    transition: "all 900ms cubic-bezier(0.16,1,0.3,1)",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              );
            })}
            <path
              d="M16 96 L45 84 L74 88 L103 70 L132 74 L161 58 L190 62 L219 46 L248 52 L277 34 L306 40 L335 22"
              fill="none"
              stroke={VERDAN_DEEP}
              strokeWidth="1.6"
              strokeLinecap="round"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: inView ? 0 : 600,
                transition: "stroke-dashoffset 1600ms ease-out 300ms",
              }}
            />
          </svg>
        </div>

        <div className="rounded-lg border border-black/5 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-medium text-[var(--color-font)]">Activity</div>
            <Activity size={12} className="text-[var(--color-font)]/45" />
          </div>
          <ul className="mt-3 flex flex-col gap-2.5">
            {activity.map((a, i) => (
              <li
                key={a.what}
                className="flex items-start gap-2.5 transition-all"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(6px)",
                  transitionDuration: "600ms",
                  transitionDelay: `${400 + i * 120}ms`,
                }}
              >
                <span
                  className="mt-1 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: "var(--verdan-green)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] text-[var(--color-font)]">{a.what}</div>
                  <div className="truncate text-[10.5px] text-[var(--color-font)]/45">
                    {a.who} · {a.t}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MapMock({ inView }: { inView: boolean }) {
  const pins = [
    { x: 22, y: 30 }, { x: 31, y: 44 }, { x: 28, y: 58 }, { x: 40, y: 36 },
    { x: 46, y: 52 }, { x: 54, y: 42 }, { x: 60, y: 60 }, { x: 68, y: 32 },
    { x: 74, y: 50 }, { x: 82, y: 40 }, { x: 78, y: 64 }, { x: 50, y: 70 },
    { x: 38, y: 74 }, { x: 64, y: 74 }, { x: 35, y: 22 }, { x: 70, y: 22 },
  ];
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="productLand" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#eef3ea" />
            <stop offset="100%" stopColor="#dde6dc" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#productLand)" />
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M -20 ${40 + i * 30} Q 100 ${20 + i * 30} 200 ${50 + i * 30} T 420 ${30 + i * 30}`}
            fill="none"
            stroke={`rgba(${VERDAN_RGB}, 0.18)`}
            strokeWidth="0.8"
          />
        ))}
        <path
          d="M 0 200 Q 80 180 140 210 T 280 200 T 400 180"
          fill="none"
          stroke="rgba(80,140,180,0.45)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 80 90 L 200 70 L 290 110 L 270 200 L 150 220 L 70 170 Z"
          fill={VERDAN}
          fillOpacity="0.10"
          stroke={VERDAN_DEEP}
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
      </svg>

      <div className="absolute inset-0">
        {pins.map((p, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: inView ? 1 : 0,
              transform: `translate(-50%, ${inView ? "-50%" : "-30%"})`,
              transition: `opacity 500ms ease-out ${i * 70}ms, transform 600ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`,
            }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                style={{ background: "var(--verdan-green)" }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{
                  background: "var(--verdan-green)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                }}
              />
            </span>
          </div>
        ))}
      </div>

      <div
        className="absolute left-[46%] top-[28%] rounded-lg border border-black/5 bg-white/90 px-3 py-2 backdrop-blur"
        style={{
          boxShadow: "0 12px 30px -16px rgba(0,0,0,0.15)",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(6px)",
          transition: "all 600ms ease-out 900ms",
        }}
      >
        <div
          className="flex items-center gap-1.5 text-[10.5px] font-medium"
          style={{ color: "var(--verdan-green)" }}
        >
          <MapPin size={11} /> Tree #VRD-04821
        </div>
        <div className="mt-0.5 text-[10.5px] tabular-nums text-[var(--color-font)]/55">
          22.5726° N · 88.3639° E
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10.5px] text-[var(--color-font)]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--verdan-green)" }}
          />{" "}
          Healthy · 2.1m
        </div>
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-black/5 bg-white/85 px-3 py-1 text-[10.5px] text-[var(--color-font)]/55 backdrop-blur">
        <Signal size={11} style={{ color: "var(--verdan-green)" }} /> 1,284 trees · 12
        clusters
      </div>
    </div>
  );
}

function PhoneFrame({
  children,
  className,
  rotate = 0,
  delay = 0,
  inView,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  delay?: number;
  inView: boolean;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        transform: inView
          ? `rotate(${rotate}deg) translateY(0)`
          : `rotate(${rotate}deg) translateY(18px)`,
        opacity: inView ? 1 : 0,
        transition: `all 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <div
        className="relative h-[440px] w-[218px] rounded-[36px] border border-[var(--color-font)]/40 bg-[var(--color-font)] p-[8px]"
        style={{
          boxShadow:
            "0 30px 60px -30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset",
        }}
      >
        <div className="absolute left-1/2 top-[14px] z-10 h-[18px] w-[78px] -translate-x-1/2 rounded-full bg-black" />
        <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-[var(--background)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function PhoneScreenRegister() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-7 text-[10px] text-[var(--color-font)]/45">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Wifi size={10} />
          <Signal size={10} />
        </div>
      </div>
      <div className="px-4 pt-3">
        <div className="text-[11px] text-[var(--color-font)]/45">New entry</div>
        <div className="text-[16px] font-medium text-[var(--color-font)]">Register Tree</div>
      </div>
      <div className="mt-3 px-4">
        <div
          className="relative h-[120px] overflow-hidden rounded-xl border border-black/5"
          style={{ background: "linear-gradient(135deg,#dfe9dc,#c7d8c5)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={22} style={{ color: "var(--verdan-green)" }} />
          </div>
          <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] text-[var(--color-font)]">
            Live capture
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2 px-4">
        {[
          { k: "Species", v: "Neem (Azadirachta)" },
          { k: "Site", v: "North Range · Block 04" },
          { k: "GPS", v: "22.572°N · 88.363°E" },
        ].map((r) => (
          <div key={r.k} className="rounded-lg border border-black/5 bg-white/80 p-2">
            <div className="text-[9px] uppercase tracking-wider text-[var(--color-font)]/45">
              {r.k}
            </div>
            <div className="text-[11px] text-[var(--color-font)]">{r.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto px-4 pb-5">
        <div
          className="flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[11px] font-medium text-white"
          style={{ background: "var(--verdan-green)" }}
        >
          <Check size={12} /> Save & sync
        </div>
      </div>
    </div>
  );
}

function PhoneScreenMap() {
  return (
    <div className="relative h-full">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg,#e6ede2,#cfdcca)" }}
      />
      <svg viewBox="0 0 220 440" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d={`M 0 ${60 + i * 50} Q 110 ${30 + i * 50} 220 ${50 + i * 50}`}
            fill="none"
            stroke={`rgba(${VERDAN_RGB}, 0.18)`}
            strokeWidth="0.8"
          />
        ))}
        <path
          d="M 0 260 Q 60 240 110 270 T 220 250"
          fill="none"
          stroke="rgba(80,140,180,0.45)"
          strokeWidth="2.5"
        />
      </svg>
      {[
        { x: 30, y: 35 }, { x: 55, y: 50 }, { x: 70, y: 30 },
        { x: 45, y: 65 }, { x: 75, y: 70 }, { x: 25, y: 80 },
        { x: 60, y: 85 }, { x: 80, y: 55 },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute h-2 w-2 rounded-full border border-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: "var(--verdan-green)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      ))}
      <div className="absolute left-3 right-3 top-7">
        <div className="rounded-full border border-black/5 bg-white/85 px-3 py-1.5 text-[10px] text-[var(--color-font)] backdrop-blur">
          <span className="font-medium" style={{ color: "var(--verdan-green)" }}>
            3 sites
          </span>{" "}
          near you
        </div>
      </div>
      <div
        className="absolute bottom-3 left-3 right-3 rounded-xl border border-black/5 bg-white/95 p-3 backdrop-blur"
        style={{ boxShadow: "0 12px 30px -16px rgba(0,0,0,0.15)" }}
      >
        <div className="text-[10px] text-[var(--color-font)]/45">Today&apos;s route</div>
        <div className="text-[13px] font-medium text-[var(--color-font)]">
          East Block · 42 stops
        </div>
        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full"
          style={{ background: `rgba(${VERDAN_RGB}, 0.12)` }}
        >
          <div className="h-full w-[62%]" style={{ background: "var(--verdan-green)" }} />
        </div>
        <div className="mt-1 text-[10px] text-[var(--color-font)]/45">26 of 42 verified</div>
      </div>
    </div>
  );
}

function PhoneScreenProfile() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-7 text-[10px] text-[var(--color-font)]/45">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Wifi size={10} />
          <Signal size={10} />
        </div>
      </div>
      <div className="px-4 pt-3">
        <div className="text-[11px] text-[var(--color-font)]/45">Tree #VRD-04821</div>
        <div className="text-[16px] font-medium text-[var(--color-font)]">Neem · Block 04</div>
      </div>
      <div className="mx-4 mt-3 rounded-xl border border-black/5 bg-white/80 p-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-[var(--color-font)]/45">Growth</div>
          <div className="text-[10px]" style={{ color: "var(--verdan-green)" }}>
            +12% this month
          </div>
        </div>
        <svg viewBox="0 0 180 60" className="mt-2 w-full">
          <path
            d="M 4 50 Q 30 42 50 38 T 100 22 T 176 8"
            fill="none"
            stroke={VERDAN}
            strokeWidth="2"
          />
          <path
            d="M 4 50 Q 30 42 50 38 T 100 22 T 176 8 L 176 60 L 4 60 Z"
            fill={VERDAN}
            opacity="0.12"
          />
        </svg>
      </div>
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        {[["Height", "2.1m"], ["Health", "98%"], ["Age", "14mo"]].map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg border border-black/5 bg-white/80 p-2 text-center"
          >
            <div className="text-[9px] uppercase text-[var(--color-font)]/45">{k}</div>
            <div className="text-[12px] text-[var(--color-font)]">{v}</div>
          </div>
        ))}
      </div>
      <div className="mx-4 mt-3 rounded-xl border border-black/5 bg-white/80 p-3">
        <div className="text-[10px] uppercase text-[var(--color-font)]/45">Timeline</div>
        <ul className="mt-2 space-y-2">
          {[
            ["Planted", "Mar 12, 2025"],
            ["Verified", "Apr 02, 2025"],
            ["Inspection", "May 18, 2025"],
          ].map(([k, v]) => (
            <li key={k} className="flex items-center gap-2 text-[11px] text-[var(--color-font)]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--verdan-green)" }}
              />
              <span className="flex-1">{k}</span>
              <span className="text-[var(--color-font)]/45">{v}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto flex items-center justify-between px-4 pb-5 text-[10px] text-[var(--color-font)]/45">
        <div className="flex items-center gap-1">
          <CheckCircle2 size={11} style={{ color: "var(--verdan-green)" }} /> Synced
        </div>
        <div className="flex items-center gap-1">
          <Upload size={11} /> Offline ready
        </div>
      </div>
    </div>
  );
}

function VerificationMock({ inView }: { inView: boolean }) {
  return (
    <div className="p-5 sm:p-7">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-black/5">
          <div className="grid grid-cols-2">
            {[
              {
                tag: "BEFORE",
                grad: "linear-gradient(135deg,#cdb594,#a48a64)",
                date: "12 Mar · 09:14",
              },
              {
                tag: "AFTER",
                grad: "linear-gradient(135deg,#9bc09f,#54895f)",
                date: "18 May · 11:42",
              },
            ].map((p) => (
              <div key={p.tag} className="relative h-[180px]" style={{ background: p.grad }}>
                <svg viewBox="0 0 200 180" className="absolute inset-0 h-full w-full opacity-60">
                  <path
                    d="M 0 140 Q 50 110 100 130 T 200 120 L 200 180 L 0 180 Z"
                    fill="rgba(0,0,0,0.18)"
                  />
                </svg>
                {p.tag === "AFTER" && (
                  <div className="absolute inset-0">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span
                        key={i}
                        className="absolute"
                        style={{
                          left: `${10 + (i * 7) % 80}%`,
                          top: `${55 + ((i * 13) % 30)}%`,
                          opacity: inView ? 1 : 0,
                          transition: `opacity 500ms ease ${i * 80}ms`,
                        }}
                      >
                        <TreePine size={14} color="#1e3a26" />
                      </span>
                    ))}
                  </div>
                )}
                <div className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white">
                  {p.tag}
                </div>
                <div className="absolute bottom-2 left-2 rounded-md bg-white/85 px-1.5 py-0.5 text-[9px] text-[var(--color-font)]">
                  {p.date}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-white/70 px-3 py-2.5 text-[11px] text-[var(--color-font)]/55">
            <div className="flex items-center gap-1.5">
              <MapPin size={11} style={{ color: "var(--verdan-green)" }} /> Site #08 · East
              Block
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "var(--verdan-green)" }}>
              <CheckCircle2 size={12} /> Verified
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-black/5 bg-white/70 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-medium text-[var(--color-font)]">
              Verification queue
            </div>
            <div className="text-[10.5px] text-[var(--color-font)]/45">4 pending</div>
          </div>
          <ul className="mt-3 space-y-2">
            {[
              { id: "SUB-2041", site: "North Range", status: "approved" },
              { id: "SUB-2042", site: "East Block", status: "approved" },
              { id: "SUB-2043", site: "Riverbed", status: "review" },
              { id: "SUB-2044", site: "South Hills", status: "review" },
              { id: "SUB-2045", site: "West Plateau", status: "rejected" },
            ].map((r, i) => (
              <li
                key={r.id}
                className="flex items-center gap-2 rounded-lg border border-black/5 bg-white/80 px-2.5 py-2"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(6px)",
                  transition: `all 500ms ease ${200 + i * 100}ms`,
                }}
              >
                <div
                  className="h-7 w-7 flex-none rounded-md"
                  style={{ background: "linear-gradient(135deg,#cfe0c8,#9fbf9c)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11.5px] text-[var(--color-font)]">{r.id}</div>
                  <div className="truncate text-[10.5px] text-[var(--color-font)]/45">
                    {r.site}
                  </div>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider"
                  style={
                    r.status === "approved"
                      ? {
                          background: `rgba(${VERDAN_RGB}, 0.12)`,
                          color: "var(--verdan-green)",
                        }
                      : r.status === "review"
                        ? { background: "rgba(184,134,27,0.12)", color: "#8a6411" }
                        : { background: "rgba(192,67,46,0.12)", color: "#9a3324" }
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMock({ inView }: { inView: boolean }) {
  const carbon = useCountUp(184.6, inView, 1600);
  return (
    <div className="p-5 sm:p-7">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-black/5 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-medium text-[var(--color-font)]">
                Survival by species
              </div>
              <div className="text-[10.5px] text-[var(--color-font)]/45">Year over year</div>
            </div>
            <div className="flex items-center gap-3 text-[10.5px] text-[var(--color-font)]/45">
              {[
                ["Neem", VERDAN],
                ["Banyan", "#7aa980"],
                ["Sal", "#c6a96b"],
              ].map(([n, c]) => (
                <div key={n} className="flex items-center gap-1">
                  <span className="h-1.5 w-3 rounded-full" style={{ background: c as string }} />{" "}
                  {n}
                </div>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 380 180" className="mt-3 w-full">
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                x2="380"
                y1={20 + i * 40}
                y2={20 + i * 40}
                stroke="rgba(0,0,0,0.06)"
              />
            ))}
            {[
              { c: VERDAN, d: "M 10 130 Q 60 110 110 96 T 220 60 T 370 32" },
              { c: "#7aa980", d: "M 10 140 Q 60 130 110 116 T 220 84 T 370 60" },
              { c: "#c6a96b", d: "M 10 150 Q 60 146 110 140 T 220 120 T 370 100" },
            ].map((l, i) => (
              <path
                key={i}
                d={l.d}
                fill="none"
                stroke={l.c}
                strokeWidth="1.8"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 700,
                  strokeDashoffset: inView ? 0 : 700,
                  transition: `stroke-dashoffset 1600ms ease-out ${i * 200}ms`,
                }}
              />
            ))}
            {["Q1", "Q2", "Q3", "Q4", "Q1", "Q2"].map((q, i) => (
              <text
                key={i}
                x={20 + i * 70}
                y={172}
                fontSize="9"
                fill="currentColor"
                className="text-[var(--color-font)]/45"
              >
                {q}
              </text>
            ))}
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="rounded-xl border border-black/5 p-4 text-white"
            style={{
              background: `linear-gradient(135deg, ${VERDAN_DEEP}, ${VERDAN})`,
            }}
          >
            <div className="text-[10.5px] uppercase tracking-wider opacity-80">
              Carbon impact (est.)
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[28px] font-light tabular-nums">{carbon.toFixed(1)}</span>
              <span className="text-[12px] opacity-80">tCO₂e / yr</span>
            </div>
            <div className="mt-1 text-[10.5px] opacity-80">across 127 active sites</div>
          </div>
          <div className="rounded-xl border border-black/5 bg-white/70 p-3">
            <div className="text-[12px] font-medium text-[var(--color-font)]">
              Top performing sites
            </div>
            <ul className="mt-2 space-y-2">
              {[
                ["North Range", 94],
                ["East Block", 89],
                ["Riverbed", 82],
                ["South Hills", 76],
              ].map(([n, v], i) => (
                <li key={n as string} className="flex items-center gap-2">
                  <div className="w-20 truncate text-[11px] text-[var(--color-font)]">{n}</div>
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full"
                    style={{ background: `rgba(${VERDAN_RGB}, 0.12)` }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: inView ? `${v}%` : "0%",
                        background: "var(--verdan-green)",
                        transition: `width 1200ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 120}ms`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-right text-[10.5px] tabular-nums text-[var(--color-font)]/45">
                    {v}%
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeSvg({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-1} y={0} width={2} height={size * 0.4} fill="#2a1d10" />
      <path
        d={`M 0 ${-size} L ${size * 0.6} ${size * 0.1} L ${-size * 0.6} ${size * 0.1} Z`}
        fill="#1f3a26"
      />
      <path
        d={`M 0 ${-size * 0.6} L ${size * 0.45} ${size * 0.05} L ${-size * 0.45} ${size * 0.05} Z`}
        fill="#2c5a3a"
      />
    </g>
  );
}

function FloatTag({
  icon,
  label,
  delay,
  inView,
}: {
  icon: React.ReactNode;
  label: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10.5px] text-white backdrop-blur-md"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: `all 800ms ease ${delay}ms`,
        boxShadow: "0 6px 20px -8px rgba(0,0,0,0.4)",
      }}
    >
      <span className="text-white/90">{icon}</span>
      {label}
    </div>
  );
}

function ClosingScene({ inView }: { inView: boolean }) {
  const trees = Array.from({ length: 48 }).map((_, i) => {
    const x = 24 + (i * 24.5) % 1150;
    const density = x / 1200;
    if (i % 5 === 0) return null;
    const y = 240 - density * 30 - (i % 5) * 4;
    const size = 10 + (i % 4) * 3 + density * 6;
    const opacity = 0.4 + density * 0.6;
    return { x, y, size, opacity, i };
  });

  return (
    <div
      className="glass-panel-strong relative overflow-hidden !rounded-[8px] border-0"
      style={{
        background: `linear-gradient(135deg, #0e1a13 0%, #1a3324 55%, ${VERDAN_DEEP} 100%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 100%)",
        }}
      />
      <svg
        viewBox="0 0 1200 380"
        className="absolute inset-x-0 bottom-0 h-[70%] w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="productGround" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6b5638" />
            <stop offset="55%" stopColor="#4f6a45" />
            <stop offset="100%" stopColor={VERDAN} />
          </linearGradient>
        </defs>
        <path
          d="M 0 240 Q 300 200 600 230 T 1200 210 L 1200 380 L 0 380 Z"
          fill="url(#productGround)"
          opacity="0.85"
        />
        {trees.map(
          (t) =>
            t && (
              <g
                key={t.i}
                style={{
                  opacity: inView ? t.opacity : 0,
                  transition: `opacity 900ms ease ${t.i * 30}ms`,
                }}
              >
                <TreeSvg x={t.x} y={t.y} size={t.size} />
              </g>
            ),
        )}
      </svg>

      <div className="absolute left-[8%] top-[18%]">
        <FloatTag
          icon={<MapPin size={11} />}
          label="22.572°N · 88.363°E"
          delay={300}
          inView={inView}
        />
      </div>
      <div className="absolute right-[10%] top-[14%]">
        <FloatTag
          icon={<TreePine size={11} />}
          label="48,213 trees tracked"
          delay={500}
          inView={inView}
        />
      </div>
      <div className="absolute right-[14%] top-[44%]">
        <FloatTag
          icon={<CheckCircle2 size={11} />}
          label="Verified · Site #08"
          delay={700}
          inView={inView}
        />
      </div>
      <div className="absolute left-[14%] top-[48%]">
        <FloatTag
          icon={<Activity size={11} />}
          label="Survival 86.4%"
          delay={900}
          inView={inView}
        />
      </div>

      <div className="relative px-6 py-16 text-center sm:px-10 sm:py-24">
        <span
          className="inline-block rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80"
          style={{
            borderColor: "rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          The bigger picture
        </span>
        <h3 className="mx-auto mt-5 max-w-3xl text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.08] tracking-tight text-white">
          Plantation is no longer invisible.
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-[15px] font-light leading-relaxed text-white/70">
          Verdan transforms environmental restoration into measurable infrastructure —
          every tree, every site, every outcome accounted for.
        </p>
      </div>
    </div>
  );
}

function BlockIndex({
  index,
  eyebrow,
}: {
  index: number;
  eyebrow: string;
}) {
  const num = String(index).padStart(2, "0");
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45">
      <span className="font-mono">{num}</span>
      <span className="h-px w-10 bg-black/10" />
      <span>{eyebrow}</span>
    </div>
  );
}

function ProductBlock({
  index,
  reverse = false,
  full = false,
  visual,
  header,
}: {
  index: number;
  reverse?: boolean;
  full?: boolean;
  visual: (inView: boolean) => React.ReactNode;
  header: { eyebrow: string; title: string; desc: string; bullets?: string[] };
}) {
  const { ref, inView } = useInView(0.12);

  if (full) {
    return (
      <div ref={ref} className="flex flex-col gap-8">
        <div className="flex flex-col items-start gap-4">
          <BlockIndex index={index} eyebrow={header.eyebrow} />
          <h3 className="max-w-3xl text-xl font-normal leading-snug tracking-tight text-[var(--color-font)] md:text-2xl">
            {header.title}
          </h3>
          <p className="max-w-2xl text-[15px] font-light leading-relaxed text-[var(--color-font)]/70">
            {header.desc}
          </p>
        </div>
        <Panel inView={inView}>{visual(inView)}</Panel>
      </div>
    );
  }

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn("flex flex-col gap-4", reverse && "lg:order-2")}>
        <BlockIndex index={index} eyebrow={header.eyebrow} />
        <BlockHeader title={header.title} desc={header.desc} bullets={header.bullets} />
      </div>
      <div className={cn(reverse && "lg:order-1")}>
        <Panel inView={inView}>{visual(inView)}</Panel>
      </div>
    </div>
  );
}

function FloatChip({
  icon,
  label,
  inView,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  inView: boolean;
  delay: number;
}) {
  return (
    <div
      className="glass-panel-strong flex items-center gap-1.5 !rounded-full px-3 py-1.5 text-[11px] text-[var(--color-font)]"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: `all 700ms ease ${delay}ms`,
      }}
    >
      <span style={{ color: "var(--verdan-green)" }}>{icon}</span>
      {label}
      <ArrowUpRight size={11} className="text-[var(--color-font)]/45" />
    </div>
  );
}

export default function Product() {
  const sectionRef = useRef<HTMLElement>(null);
  const [headVisible, setHeadVisible] = useState(false);
  const { ref: mobRef, inView: mobIn } = useInView(0.12);
  const { ref: closeRef, inView: closeIn } = useInView(0.15);

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
      id="product"
      ref={sectionRef}
      className="section-noise relative w-full scroll-mt-[4.25rem] overflow-hidden px-6 py-32 text-[var(--color-font)] md:px-12 lg:px-20"
      style={{ background: "var(--background)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(900px 500px at 12% 8%, rgba(${VERDAN_RGB},0.08), transparent 60%),
                            radial-gradient(700px 420px at 88% 72%, rgba(${VERDAN_RGB},0.05), transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div
          className={cn(
            "mx-auto max-w-3xl transition-all duration-700",
            headVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-[12px] font-medium tracking-wide",
              headVisible && "hero-animate-fade-slide-up-sm",
            )}
            style={{
              borderColor: "rgba(var(--verdan-green-rgb), 0.25)",
              background: "rgba(var(--verdan-green-rgb), 0.06)",
              color: "var(--verdan-green)",
            }}
          >
            THE PRODUCT
          </span>
          <PageHeadline
            line1="Built for real-world"
            line2="plantation operations."
            line2ClassName="text-[var(--verdan-green)]"
            className={cn("mt-5", headVisible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg font-light leading-relaxed text-[var(--color-font)]/70",
              headVisible && "hero-animate-fade-slide-up-sm",
            )}
          >
            From field tracking to growth analytics, Verdan connects every stage of
            plantation management — one workspace for administrators, field teams, and
            verification partners.
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-24 lg:mt-24 lg:gap-32">
          <ProductBlock
            index={1}
            header={{
              eyebrow: "Central dashboard",
              title: "Monitor every plantation from one dashboard.",
              desc: "Track sites, field activity, survival rates and verification status in real time — with the operational depth your teams need.",
              bullets: [
                "Live KPIs across every active site",
                "Verification queue with audit trail",
                "Monthly plantation & survival analytics",
              ],
            }}
            visual={(inView) => <DashboardMock inView={inView} />}
          />

          <ProductBlock
            index={2}
            reverse
            header={{
              eyebrow: "GPS tree mapping",
              title: "Every tree mapped, precisely.",
              desc: "Geo-tagged plantations with site boundaries, clusters and per-tree coordinates — built for accountability at scale.",
              bullets: [
                "Per-tree GPS with satellite overlays",
                "Clustered zones & boundary polygons",
                "Live field tracking indicators",
              ],
            }}
            visual={(inView) => <MapMock inView={inView} />}
          />

          <div ref={mobRef} className="flex flex-col items-center gap-10 text-center">
            <BlockIndex index={3} eyebrow="Mobile app" />
            <div className="flex flex-col items-center gap-4">
              <h3 className="max-w-2xl text-xl font-normal leading-snug tracking-tight text-[var(--color-font)] md:text-2xl">
                Built for field teams.
              </h3>
              <p className="max-w-xl text-[15px] font-light leading-relaxed text-[var(--color-font)]/70">
                Capture plantations directly from the field — GPS, photo, species and site,
                all synced when you&apos;re back online.
              </p>
            </div>

            <div className="relative flex w-full items-center justify-center pt-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 h-[80%] -translate-y-1/2 rounded-full opacity-40"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(${VERDAN_RGB},0.12), transparent 70%)`,
                }}
              />
              <div className="flex items-end justify-center sm:gap-2">
                <div className="hidden sm:block">
                  <PhoneFrame rotate={-6} delay={100} inView={mobIn}>
                    <PhoneScreenMap />
                  </PhoneFrame>
                </div>
                <div className="-mx-6 sm:mx-0 sm:-mb-6 sm:scale-110">
                  <PhoneFrame rotate={0} delay={250} inView={mobIn}>
                    <PhoneScreenRegister />
                  </PhoneFrame>
                </div>
                <div className="hidden sm:block">
                  <PhoneFrame rotate={6} delay={400} inView={mobIn}>
                    <PhoneScreenProfile />
                  </PhoneFrame>
                </div>
              </div>

              <div className="pointer-events-none absolute left-[6%] top-[18%] hidden sm:block">
                <FloatChip
                  label="GPS locked"
                  icon={<MapPin size={11} />}
                  inView={mobIn}
                  delay={600}
                />
              </div>
              <div className="pointer-events-none absolute right-[6%] top-[28%] hidden sm:block">
                <FloatChip
                  label="Uploading 3 photos"
                  icon={<Upload size={11} />}
                  inView={mobIn}
                  delay={750}
                />
              </div>
              <div className="pointer-events-none absolute bottom-[10%] right-[10%] hidden sm:block">
                <FloatChip
                  label="Offline · synced"
                  icon={<CheckCircle2 size={11} />}
                  inView={mobIn}
                  delay={900}
                />
              </div>
            </div>
          </div>

          <ProductBlock
            index={4}
            full
            header={{
              eyebrow: "Verification workflow",
              title: "Transparent verification & documentation.",
              desc: "Timestamped photos, side-by-side comparisons and approval workflows that turn field activity into auditable evidence.",
            }}
            visual={(inView) => <VerificationMock inView={inView} />}
          />

          <ProductBlock
            index={5}
            reverse
            header={{
              eyebrow: "Growth analytics",
              title: "Measure long-term environmental impact.",
              desc: "Survival analytics, species comparisons and estimated carbon impact — built to prove restoration, not just claim it.",
              bullets: [
                "Year-over-year survival by species",
                "Estimated carbon impact per site",
                "Top performing site rankings",
              ],
            }}
            visual={(inView) => <AnalyticsMock inView={inView} />}
          />

          <div ref={closeRef}>
            <ClosingScene inView={closeIn} />
          </div>
        </div>
      </div>
    </section>
  );
}
