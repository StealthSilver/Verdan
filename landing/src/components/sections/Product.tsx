"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  FileCheck2,
  LineChart,
  MapPin,
  ScanLine,
  Signal,
  Sprout,
  Upload,
} from "lucide-react";
import { DashboardNavbar } from "@/components/HeroDashboard";
import { cn } from "@/lib/utils";
import { beginNowCtaClassName } from "@/components/ui/BeginNowButton";
import { PageHeadline } from "@/components/ui/PageHeadline";
import { landingInSectionGap, landingSectionPad } from "@/lib/site-layout";
import {
  typeBody,
  typeBullet,
  typeCardTitle,
  typeCaptionMedium,
  typeEyebrow,
  typeLedeMax,
  typeSectionIntro,
  typeTitle,
} from "@/lib/typography";

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
      <h3 className={typeTitle}>{title}</h3>
      <p className={cn("max-w-[46ch]", typeBody)}>{desc}</p>
      {bullets && (
        <ul className="mt-1 flex flex-col gap-2.5">
          {bullets.map((b) => (
            <li
              key={b}
              className={typeBullet}
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
  heroPanel = false,
}: {
  children: React.ReactNode;
  className?: string;
  inView: boolean;
  delay?: number;
  heroPanel?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden !rounded-[8px] transition-all duration-700",
        heroPanel
          ? "hover:-translate-y-1"
          : "glass-panel-strong hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(var(--verdan-green-rgb),0.28)]",
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {!heroPanel && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px 260px at 50% 0%, rgba(${VERDAN_RGB},0.1), transparent 60%)`,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function DashboardChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-xs font-medium text-gray-900">{title}</span>
        {subtitle ? (
          <span className="text-[10px] text-gray-500">{subtitle}</span>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const PLANTATION_BARS = [38, 52, 44, 64, 58, 72, 66, 80, 74, 88, 82, 94];

const SCATTER_POINTS = [
  { x: 42, y: 68, r: 4.5 },
  { x: 58, y: 52, r: 5.5 },
  { x: 72, y: 78, r: 4 },
  { x: 88, y: 44, r: 6 },
  { x: 104, y: 62, r: 5 },
  { x: 118, y: 36, r: 4.5 },
  { x: 132, y: 58, r: 5.5 },
  { x: 148, y: 72, r: 4 },
  { x: 164, y: 48, r: 6.5 },
  { x: 178, y: 64, r: 5 },
  { x: 192, y: 28, r: 4 },
  { x: 206, y: 54, r: 5.5 },
  { x: 220, y: 76, r: 4.5 },
  { x: 236, y: 42, r: 6 },
  { x: 252, y: 60, r: 5 },
  { x: 268, y: 34, r: 4.5 },
  { x: 282, y: 70, r: 5.5 },
  { x: 296, y: 50, r: 4 },
  { x: 312, y: 82, r: 6 },
  { x: 326, y: 38, r: 5 },
] as const;

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

  return (
    <div
      className="w-full"
      role="img"
      aria-label="Harit plantation overview dashboard with live KPIs and analytics charts"
    >
      <div className="hero-dashboard-panel overflow-hidden rounded-[8px] bg-[#f8fafc]">
        <div className="flex w-full flex-col overflow-hidden bg-white">
          <DashboardNavbar />
          <div className="flex flex-col bg-[#f8fafc] px-5 py-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                  <div
                    className="mt-0.5 text-[10.5px]"
                    style={{ color: "var(--verdan-green)" }}
                  >
                    {s.delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <DashboardChartCard
                title="Monthly Plantation Activity"
                subtitle="Last 12 months"
              >
                <svg viewBox="0 0 360 140" className="w-full">
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
                  {PLANTATION_BARS.map((h, i) => {
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
                        fill="#48845c"
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
              </DashboardChartCard>

              <DashboardChartCard
                title="Site survival distribution"
                subtitle="By cluster"
              >
                <svg viewBox="0 0 360 140" className="w-full">
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      x2="360"
                      y1={20 + i * 30}
                      y2={20 + i * 30}
                      stroke="rgba(0,0,0,0.06)"
                    />
                  ))}
                  {[72, 108, 144, 180, 216, 252, 288].map((x) => (
                    <line
                      key={`v-${x}`}
                      x1={x}
                      x2={x}
                      y1="20"
                      y2="130"
                      stroke="rgba(0,0,0,0.04)"
                    />
                  ))}
                  {SCATTER_POINTS.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={140 - p.y}
                      r={inView ? p.r : 0}
                      fill="#48845c"
                      fillOpacity={0.35 + (i % 3) * 0.15}
                      stroke="#48845c"
                      strokeWidth="1.2"
                      strokeOpacity={0.7}
                      style={{
                        transition: "all 700ms cubic-bezier(0.16,1,0.3,1)",
                        transitionDelay: `${200 + i * 35}ms`,
                      }}
                    />
                  ))}
                  <path
                    d="M32 108 L88 92 L142 78 L198 64 L254 48 L310 36"
                    fill="none"
                    stroke={VERDAN_DEEP}
                    strokeWidth="1.4"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    style={{
                      opacity: inView ? 0.55 : 0,
                      transition: "opacity 1200ms ease-out 400ms",
                    }}
                  />
                </svg>
              </DashboardChartCard>
            </div>
          </div>
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
        <rect width="400" height="300" fill="var(--background)" />
        <path
          d="M 80 90 L 200 70 L 290 110 L 270 200 L 150 220 L 70 170 Z"
          fill="url(#productLand)"
        />
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
          fill="none"
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

const PHONE_SITE_PATH =
  "M 28 52 L 108 40 L 172 62 L 162 128 L 88 142 L 30 112 Z";

const PHONE_MAP_PINS = [
  { x: 32, y: 38 },
  { x: 48, y: 52 },
  { x: 62, y: 34 },
  { x: 44, y: 68 },
  { x: 72, y: 72 },
  { x: 28, y: 78 },
  { x: 58, y: 82 },
  { x: 76, y: 48 },
] as const;

function PhoneAppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Image
            src="/icon.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
            className="h-5 w-5 shrink-0"
          />
          <span className="text-[10px] font-bold text-gray-900">हरित</span>
        </div>
        <span className="rounded-full bg-green-100 px-2 py-px text-[8px] font-medium text-[#2d6a4f]">
          Field
        </span>
      </div>
      <div className="border-t border-gray-100 px-3 pb-2 pt-1.5">
        {subtitle ? <p className="text-[9px] text-gray-500">{subtitle}</p> : null}
        <h2 className="text-[12px] font-bold leading-snug text-gray-900">{title}</h2>
      </div>
    </div>
  );
}

function PhoneCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-gray-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PhoneFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-100 px-2.5 py-2 last:border-b-0">
      <div className="text-[8px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-0.5 text-[10px] font-medium text-gray-900">{value}</div>
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
        className="relative h-[440px] w-[218px] rounded-[36px] border border-gray-300/80 bg-gray-900 p-[7px] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.32)]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.08), 0 24px 50px -24px rgba(0,0,0,0.32), 0 0 40px rgba(72,132,92,0.12)",
        }}
      >
        <div className="absolute left-1/2 top-[13px] z-10 h-[17px] w-[72px] -translate-x-1/2 rounded-full bg-black" />
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-gray-200/60 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

function PhoneScreenRegister() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PhoneAppHeader title="Register Tree" subtitle="New field entry" />
      <div className="min-h-0 flex-1 overflow-hidden bg-[#f8fafc] px-3 py-2.5">
        <PhoneCard className="mb-2">
          <div
            className="relative flex h-[100px] items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, #eef3ea 0%, #dde6dc 100%)",
            }}
          >
            <Camera size={20} className="text-[#48845c]" strokeWidth={1.75} />
            <span className="absolute bottom-2 left-2 rounded border border-gray-200 bg-white px-2 py-0.5 text-[8px] font-medium text-gray-700">
              Live capture
            </span>
          </div>
        </PhoneCard>
        <PhoneCard>
          <PhoneFieldRow label="Species" value="Neem (Azadirachta)" />
          <PhoneFieldRow label="Site" value="North Range · Block 04" />
          <PhoneFieldRow label="GPS" value="22.572°N · 88.363°E" />
        </PhoneCard>
      </div>
      <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2.5">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded bg-[#48845c] py-2 text-[10px] font-medium text-white transition-colors hover:bg-[#3d7149]"
        >
          <Check size={11} strokeWidth={2.5} aria-hidden />
          Save &amp; sync
        </button>
      </div>
    </div>
  );
}

function PhoneScreenMap() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PhoneAppHeader title="Site map" subtitle="North Range · Block 04" />
      <div className="relative min-h-0 flex-1 bg-[var(--background)]">
        <svg viewBox="0 0 220 280" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="phoneMapLand" cx="50%" cy="45%" r="75%">
              <stop offset="0%" stopColor="#eef3ea" />
              <stop offset="100%" stopColor="#dde6dc" />
            </radialGradient>
          </defs>
          <rect width="220" height="280" fill="var(--background)" />
          <path d={PHONE_SITE_PATH} fill="url(#phoneMapLand)" />
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={i}
              d={`M -10 ${36 + i * 38} Q 110 ${18 + i * 38} 230 ${32 + i * 38}`}
              fill="none"
              stroke={`rgba(${VERDAN_RGB}, 0.18)`}
              strokeWidth="0.7"
            />
          ))}
          <path
            d="M 0 188 Q 70 172 110 198 T 220 178"
            fill="none"
            stroke="rgba(80,140,180,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={PHONE_SITE_PATH}
            fill="none"
            stroke={VERDAN_DEEP}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </svg>
        {PHONE_MAP_PINS.map((p, i) => (
          <span
            key={i}
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#48845c] shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
        <div className="absolute left-2.5 right-2.5 top-2">
          <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[9px] text-gray-700 shadow-sm">
            <span className="font-semibold text-[#48845c]">3 sites</span> near you
          </div>
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <PhoneCard className="shadow-sm">
            <div className="px-2.5 py-2">
              <div className="text-[8px] font-medium uppercase tracking-wide text-gray-500">
                Today&apos;s route
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-gray-900">
                East Block · 42 stops
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[62%] rounded-full bg-[#48845c]" />
              </div>
              <div className="mt-1 text-[9px] text-gray-500">26 of 42 verified</div>
            </div>
          </PhoneCard>
        </div>
      </div>
    </div>
  );
}

function PhoneScreenProfile() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PhoneAppHeader title="Neem · Block 04" subtitle="Tree #VRD-04821" />
      <div className="min-h-0 flex-1 space-y-2 overflow-hidden bg-[#f8fafc] px-3 py-2.5">
        <PhoneCard>
          <div className="flex items-center justify-between border-b border-gray-100 px-2.5 py-2">
            <span className="text-[8px] font-semibold uppercase tracking-wide text-gray-500">
              Growth
            </span>
            <span className="text-[9px] font-medium text-[#48845c]">+12% this month</span>
          </div>
          <svg viewBox="0 0 180 52" className="w-full px-2 pb-2 pt-1" aria-hidden>
            <path
              d="M 4 44 Q 30 36 50 32 T 100 18 T 176 6"
              fill="none"
              stroke="#48845c"
              strokeWidth="1.75"
            />
            <path
              d="M 4 44 Q 30 36 50 32 T 100 18 T 176 6 L 176 52 L 4 52 Z"
              fill="#48845c"
              fillOpacity="0.1"
            />
          </svg>
        </PhoneCard>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Height", value: "2.1m" },
            { label: "Health", value: "98%" },
            { label: "Age", value: "14mo" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-black/5 bg-white/90 p-2 text-center"
            >
              <div className="text-[8px] font-medium uppercase tracking-wide text-gray-500">
                {s.label}
              </div>
              <div className="mt-0.5 text-[11px] font-light tabular-nums text-gray-900">
                {s.value}
              </div>
            </div>
          ))}
        </div>
        <PhoneCard>
          <div className="px-2.5 py-2">
            <div className="text-[8px] font-semibold uppercase tracking-wide text-gray-500">
              Timeline
            </div>
            <ul className="mt-2 space-y-1.5">
              {[
                ["Planted", "Mar 12, 2025"],
                ["Verified", "Apr 02, 2025"],
                ["Inspection", "May 18, 2025"],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center gap-2 text-[10px] text-gray-800"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#48845c]" />
                  <span className="flex-1 font-medium">{k}</span>
                  <span className="text-gray-500">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </PhoneCard>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-3 py-2 text-[9px] text-gray-500">
        <span className="flex items-center gap-1 font-medium text-[#48845c]">
          <CheckCircle2 size={10} strokeWidth={2} aria-hidden />
          Synced
        </span>
        <span className="flex items-center gap-1">
          <Upload size={10} strokeWidth={2} aria-hidden />
          Offline ready
        </span>
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
    <div className={cn("flex items-center gap-2.5", typeEyebrow)}>
      <span className="font-mono">{num}</span>
      <span>{eyebrow}</span>
    </div>
  );
}

function ProductBlock({
  index,
  reverse = false,
  heroPanel = false,
  visual,
  header,
}: {
  index: number;
  reverse?: boolean;
  heroPanel?: boolean;
  visual: (inView: boolean) => React.ReactNode;
  header: { eyebrow: string; title: string; desc: string; bullets?: string[] };
}) {
  const { ref, inView } = useInView(0.12);

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn("flex flex-col gap-4", reverse && "lg:order-2")}>
        <BlockIndex index={index} eyebrow={header.eyebrow} />
        <BlockHeader title={header.title} desc={header.desc} bullets={header.bullets} />
      </div>
      <div className={cn(reverse && "lg:order-1")}>
        <Panel inView={inView} heroPanel={heroPanel}>
          {visual(inView)}
        </Panel>
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
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-800 shadow-sm"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: `all 700ms ease ${delay}ms`,
      }}
    >
      <span className="text-[#48845c]">{icon}</span>
      {label}
      <ArrowUpRight size={11} className="text-[var(--color-font)]/45" />
    </div>
  );
}

type WorkflowStep = {
  n: string;
  eyebrow: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  meta: { label: string; value: string }[];
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    n: "01",
    eyebrow: "Onboard",
    title: "Set up your site",
    desc: "Draw your plantation boundary, invite your field team, and define the species and goals you're tracking.",
    icon: <Sprout size={18} strokeWidth={1.6} />,
    meta: [
      { label: "Setup time", value: "< 10 min" },
      { label: "Team roles", value: "Admin · Field · Auditor" },
    ],
  },
  {
    n: "02",
    eyebrow: "Capture",
    title: "Register trees from the field",
    desc: "Field teams use the mobile app to capture each tree — GPS, photo, species — even fully offline.",
    icon: <MapPin size={18} strokeWidth={1.6} />,
    meta: [
      { label: "Per-tree data", value: "GPS · Photo · Species" },
      { label: "Connectivity", value: "Offline-ready" },
    ],
  },
  {
    n: "03",
    eyebrow: "Verify",
    title: "Auto-verify & audit",
    desc: "Submissions are checked against site boundaries and duplicates, then routed to auditors with a full trail.",
    icon: <ScanLine size={18} strokeWidth={1.6} />,
    meta: [
      { label: "Checks", value: "Geo-fence · Dedupe" },
      { label: "Trail", value: "Immutable log" },
    ],
  },
  {
    n: "04",
    eyebrow: "Monitor",
    title: "Track growth & survival",
    desc: "Live dashboards show survival rate, growth trends, and field activity across every site in real time.",
    icon: <LineChart size={18} strokeWidth={1.6} />,
    meta: [
      { label: "Refresh", value: "Real-time" },
      { label: "Insights", value: "Survival · Growth · Health" },
    ],
  },
  {
    n: "05",
    eyebrow: "Report",
    title: "Export verified impact",
    desc: "Generate ESG, CSR and carbon-ready reports from verified plantation data — sharable in one click.",
    icon: <FileCheck2 size={18} strokeWidth={1.6} />,
    meta: [
      { label: "Formats", value: "ESG · CSR · Carbon" },
      { label: "Delivery", value: "PDF · API" },
    ],
  },
];

function WorkflowStepCard({
  step,
  index,
  inView,
}: {
  step: WorkflowStep;
  index: number;
  inView: boolean;
}) {
  const delay = 120 + index * 110;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-5 overflow-hidden glass-panel-strong !rounded-[8px] p-6 transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(var(--verdan-green-rgb),0.28)]",
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(500px 240px at 50% 0%, rgba(var(--verdan-green-rgb),0.10), transparent 60%)",
        }}
      />
      <div className="relative flex items-center justify-between">
        <div className={cn("flex items-center gap-2.5", typeEyebrow)}>
          <span className="font-mono">{step.n}</span>
          <span>{step.eyebrow}</span>
        </div>
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]"
          style={{
            background: "rgba(var(--verdan-green-rgb), 0.08)",
            color: "var(--verdan-green)",
          }}
        >
          {step.icon}
        </span>
      </div>
      <div className="relative flex flex-col gap-3">
        <h4 className={typeCardTitle}>{step.title}</h4>
        <p className={typeBody}>
          {step.desc}
        </p>
      </div>
      <div className="relative mt-auto grid grid-cols-2 gap-2 border-t border-[rgba(14,14,14,0.08)] pt-4">
        {step.meta.map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5">
            <span className={typeCaptionMedium}>{m.label}</span>
            <span className="text-sm font-light text-[var(--color-font)]/85">
              {m.value}
            </span>
          </div>
        ))}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--verdan-green), transparent)",
        }}
      />
    </div>
  );
}

function HowItWorksBlock() {
  const { ref: headRef, inView: headIn } = useInView(0.15);
  const { ref: gridRef, inView: gridIn } = useInView(0.1);

  return (
    <div
      id="how-it-works"
      ref={headRef}
      className={cn("flex scroll-mt-[4.25rem] flex-col gap-10", landingInSectionGap)}
    >
      <BlockIndex index={4} eyebrow="How it works" />
      <div
        className={cn(
          "flex flex-col gap-4 transition-all duration-700",
          headIn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <PageHeadline
          line1="From seedling to verified"
          line2="impact, in five steps."
          line2ClassName="text-[var(--color-font)]"
          className={cn(headIn && "hero-animate-fade-slide-up")}
        />
        <p
          className={cn(
            typeLedeMax,
            headIn && "hero-animate-fade-slide-up-sm",
          )}
        >
          Verdan turns every plantation into a transparent, measurable workflow. Set up
          your site, capture trees from the field, and watch verified impact unfold in
          real time.
        </p>
      </div>

      <div ref={gridRef} className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 lg:block"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${VERDAN_RGB},0.35), rgba(${VERDAN_RGB},0.35), transparent)`,
            opacity: gridIn ? 1 : 0,
            transition: "opacity 900ms ease-out 200ms",
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {WORKFLOW_STEPS.map((s, i) => (
            <WorkflowStepCard key={s.n} step={s} index={i} inView={gridIn} />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "glass-panel-strong flex flex-col gap-4 !rounded-[8px] p-6 transition-all duration-700 sm:flex-row sm:items-center sm:justify-between sm:p-8",
          gridIn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
        style={{ transitionDelay: "780ms" }}
      >
        <div className="flex flex-col gap-1.5">
          <span className={typeEyebrow}>Get started</span>
          <h4 className={typeTitle}>Start monitoring your plantation today.</h4>
          <p className={cn("max-w-xl", typeBody)}>
            Onboard your first site in under ten minutes — no infrastructure, no
            hardware, just your team and the app.
          </p>
        </div>
        <Link
          href="#cta"
          className={cn(beginNowCtaClassName, "shrink-0 px-5 py-3")}
          style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
        >
          <span className="begin-now-cta__label">Begin monitoring</span>
          <svg
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="begin-now-cta__arrow h-[0.85em] w-[0.85em] shrink-0"
          >
            <path d="M0.5 5.5h7" />
            <path d="M1.5 1.5l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function Product() {
  const sectionRef = useRef<HTMLElement>(null);
  const [headVisible, setHeadVisible] = useState(false);
  const { ref: mobRef, inView: mobIn } = useInView(0.12);

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
      className={cn(
        "section-noise relative w-full overflow-hidden px-6 text-[var(--color-font)] md:px-12 lg:px-20",
        landingSectionPad,
      )}
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
            "max-w-3xl transition-all duration-700",
            headVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <PageHeadline
            line1="Built for real-world"
            line2="plantation operations."
            line2ClassName="text-[var(--color-font)]"
            className={cn(headVisible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              typeSectionIntro,
              headVisible && "hero-animate-fade-slide-up-sm",
            )}
          >
            From field tracking to growth analytics, Harit connects every stage of
            plantation management, one workspace for administrators, field teams, and
            verification partners.
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-24 lg:mt-24 lg:gap-32">
          <ProductBlock
            index={1}
            heroPanel
            header={{
              eyebrow: "Central dashboard",
              title: "Monitor every plantation from one dashboard.",
              desc: "Track sites, field activity, survival rates and verification status in real time, with the operational depth your teams need.",
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
              desc: "Geo-tagged plantations with site boundaries, clusters and per-tree coordinates, built for accountability at scale.",
              bullets: [
                "Per-tree GPS with satellite overlays",
                "Clustered zones & boundary polygons",
                "Live field tracking indicators",
              ],
            }}
            visual={(inView) => <MapMock inView={inView} />}
          />

          <div ref={mobRef} className="flex flex-col gap-10">
            <BlockIndex index={3} eyebrow="Mobile app" />
            <div className="flex flex-col gap-4">
              <h3 className={cn("max-w-2xl", typeTitle)}>Built for field teams.</h3>
              <p className={cn("max-w-xl", typeBody)}>
                Capture plantations directly from the field: GPS, photo, species and site,
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
        </div>

        <HowItWorksBlock />
      </div>
    </section>
  );
}
