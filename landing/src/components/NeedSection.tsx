"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";

const ALERT = "#c0432e";
const WARN = "#b8861b";

function useCountUp(target: number, start: boolean, duration = 1600) {
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

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function ActBadge({ n }: { n: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
      style={{ background: "var(--verdan-green)" }}
    >
      {n}
    </span>
  );
}

function ActTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45">
      {children}
    </h3>
  );
}

function StatTile({
  value,
  suffix = "%",
  label,
  tone = "alert",
  inView,
  decimals = 0,
  prefix = "",
}: {
  value: number;
  suffix?: string;
  label: string;
  tone?: "alert" | "verdan" | "neutral";
  inView: boolean;
  decimals?: number;
  prefix?: string;
}) {
  const n = useCountUp(value, inView);
  const display = decimals
    ? n.toFixed(decimals)
    : Math.round(n).toLocaleString();
  const toneColor =
    tone === "alert"
      ? ALERT
      : tone === "verdan"
        ? "var(--verdan-green)"
        : "var(--color-font)";

  return (
    <div className="glass-panel-strong group relative !rounded-[8px] overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
        style={{
          background: `radial-gradient(closest-side, ${tone === "verdan" ? "rgba(var(--verdan-green-rgb), 0.45)" : tone === "alert" ? "rgba(192,67,46,0.35)" : "rgba(0,0,0,0.12)"}, transparent)`,
        }}
      />
      <div
        className="flex items-baseline gap-1 font-light tracking-tight"
        style={{ color: toneColor }}
      >
        <span className="text-3xl md:text-4xl">
          {prefix}
          {display}
        </span>
        <span className="text-xl md:text-2xl">{suffix}</span>
      </div>
      <p className="relative mt-3 text-[13px] font-light leading-relaxed text-[var(--color-font)]/65">
        {label}
      </p>
    </div>
  );
}

export default function NeedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [headVisible, setHeadVisible] = useState(false);
  const { ref: statsRef, inView: statsIn } = useInView<HTMLDivElement>(0.15);
  const { ref: ironyRef, inView: ironyIn } = useInView<HTMLDivElement>(0.2);
  const { ref: gapRef, inView: gapIn } = useInView<HTMLDivElement>(0.15);

  const survival = useCountUp(80, statsIn, 1800);
  const failed = useCountUp(79, statsIn, 1800);

  const blindSpots = [
    "Excel sheets & manual field logs",
    "Unverified photographs",
    "Delayed, non-standard reporting",
    "No geospatial accountability",
    "No survival analytics",
    "Trees counted multiple times",
  ];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setHeadVisible(true),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="the-need"
      ref={sectionRef}
      className="section-noise relative w-full scroll-mt-[4.25rem] overflow-hidden px-6 py-28 text-[var(--color-font)] md:px-12 md:py-32 lg:px-20"
      style={{ background: "var(--background)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 z-0 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "rgba(var(--verdan-green-rgb), 0.09)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-16 z-0 h-[360px] w-[360px] rounded-full blur-3xl"
        style={{ background: "rgba(192, 67, 46, 0.06)" }}
      />

      <div className="relative z-[1] mx-auto max-w-6xl">
        {/* Heading */}
        <div className="max-w-3xl">
          <PageHeadline
            line1="The world is planting more trees than ever."
            line2="Almost no one is watching them grow."
            line2ClassName="text-alert"
            className={cn(headVisible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-2xl text-[15px] font-light leading-relaxed text-[var(--color-font)]/70 md:text-base",
              headVisible && "hero-animate-fade-slide-up-sm"
            )}
          >
            Governments, corporates and NGOs spend billions on afforestation each
            year yet plantation success is still measured by trees{" "}
            <em>planted</em>, not trees <em>surviving</em>. That single gap
            changes everything.
          </p>
        </div>

        {/* Act 1 — Accountability crisis */}
        <div ref={statsRef} className="mt-20 md:mt-24">
          <div className="flex items-center gap-3">
            <ActBadge n="01" />
            <ActTitle>The plantation accountability crisis</ActTitle>
          </div>
          <p
            className={cn(
              "mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-[var(--color-font)]/75 md:text-base",
              statsIn && "hero-animate-fade-slide-up-sm"
            )}
          >
            A global reforestation integrity study reviewed{" "}
            <span className="font-normal" style={{ color: "var(--verdan-green)" }}>
              1.28M planting sites
            </span>{" "}
            across 45,000+ projects. The findings were sobering.
          </p>

          <div
            className={cn(
              "reveal-stagger mt-10 grid gap-4 md:grid-cols-3",
              statsIn && "is-visible"
            )}
          >
            <StatTile
              inView={statsIn}
              value={79}
              label="of monitored sites failed at least one location integrity indicator."
            />
            <StatTile
              inView={statsIn}
              value={15}
              label="lacked machine-readable geographic data entirely."
              tone="neutral"
            />
            <StatTile
              inView={statsIn}
              value={1.28}
              suffix="M"
              decimals={2}
              label="sites analyzed, many depending on self-reported claims."
              tone="verdan"
            />
          </div>

          <div
            className={cn(
              "glass-panel-strong mt-8 !rounded-[8px] overflow-hidden p-6 md:p-8",
              statsIn && "hero-animate-fade-slide-up-sm"
            )}
            style={{
              boxShadow: "0 18px 60px -28px rgba(var(--verdan-green-rgb), 0.28)",
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45">
                  TerraFund survival thresholds
                </p>
                <p className="mt-2 text-[15px] font-light leading-relaxed text-[var(--color-font)]/75 md:text-base">
                  Below <strong style={{ color: ALERT }}>70%</strong> a restoration
                  project is considered <strong className="font-normal">at risk</strong>.
                  Below <strong style={{ color: WARN }}>80%</strong> requires
                  intervention.
                </p>
              </div>
              <div className="text-right">
                <div
                  className="text-4xl font-light tracking-tight md:text-5xl"
                  style={{ color: "var(--verdan-green)" }}
                >
                  {Math.round(survival)}%
                </div>
                <div className="text-[12px] font-light text-[var(--color-font)]/50">
                  healthy threshold
                </div>
              </div>
            </div>

            <div className="relative mt-6 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="absolute inset-y-0 left-0 transition-[width] duration-1000 ease-out"
                style={{
                  width: statsIn ? "100%" : "0%",
                  background: `linear-gradient(
                    to right,
                    ${ALERT} 0%,
                    ${ALERT} 70%,
                    ${WARN} 70%,
                    ${WARN} 80%,
                    var(--verdan-green) 80%,
                    var(--verdan-green) 100%
                  )`,
                }}
              />
              <div className="pointer-events-none absolute left-[70%] top-0 h-full w-px bg-white/50" />
              <div className="pointer-events-none absolute left-[80%] top-0 h-full w-px bg-white/50" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-[var(--color-font)]/40">
              <span>0%</span>
              <span style={{ color: ALERT }}>at risk · 70%</span>
              <span style={{ color: WARN }}>intervention · 80%</span>
              <span>100%</span>
            </div>

            <p className="mt-6 text-[15px] font-light italic text-[var(--color-font)]/60">
              &ldquo;A tree not monitored is usually a tree lost.&rdquo;
            </p>
          </div>

          <div
            className={cn(
              "mt-6 flex items-center gap-2.5 text-[14px] font-light text-[var(--color-font)]/60",
              statsIn && "hero-animate-fade-slide-up-sm"
            )}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: ALERT }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ background: ALERT }}
              />
            </span>
            <span>
              <strong className="font-normal" style={{ color: ALERT }}>
                {Math.round(failed)}%
              </strong>{" "}
              of monitored sites are failing integrity checks right now.
            </span>
          </div>
        </div>

        {/* Act 2 — Renewable contradiction */}
        <div ref={ironyRef} className="mt-24 md:mt-28">
          <div className="flex items-center gap-3">
            <ActBadge n="02" />
            <ActTitle>Renewable energy&apos;s hidden contradiction</ActTitle>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-12 md:gap-6">
            <div
              className={cn(
                "md:col-span-5",
                ironyIn && "hero-animate-fade-slide-up"
              )}
            >
              <h4 className="text-2xl font-medium leading-tight tracking-tight md:text-3xl">
                To build{" "}
                <span className="text-[var(--color-font)]">clean energy</span>,
                ecosystems are being cleared at industrial scale.
              </h4>
              <p className="mt-5 text-[15px] font-light leading-relaxed text-[var(--color-font)]/65">
                The world talks about net-zero while quietly removing the natural
                carbon sinks that make net-zero possible.
              </p>
            </div>

            <div
              className={cn(
                "reveal-stagger md:col-span-7 grid grid-cols-2 gap-4",
                ironyIn && "is-visible"
              )}
            >
              <StatTile
                inView={ironyIn}
                value={74}
                label="of India's solar development on ecologically valuable or agricultural land."
              />
              <StatTile
                inView={ironyIn}
                value={6320}
                suffix="+"
                label="solar farms globally linked to forest & ecological land conflicts."
                tone="neutral"
              />
              <StatTile
                inView={ironyIn}
                value={4500}
                suffix=" ha"
                label="of native vegetation destroyed by renewable projects in Brazil in 2023 alone."
              />
              <StatTile
                inView={ironyIn}
                value={9.5}
                suffix="×"
                decimals={1}
                label="rise in deforestation tied to solar & wind in Brazil over four years."
                tone="neutral"
              />
            </div>
          </div>
        </div>

        {/* Act 3 — Easy to plant. Hard to prove. */}
        <div ref={gapRef} className="mt-24 md:mt-28">
          <div className="flex items-center gap-3">
            <ActBadge n="03" />
            <ActTitle>Planting is easy. Proving survival is hard.</ActTitle>
          </div>

          <div
            className={cn(
              "reveal-stagger mt-8 grid gap-5 md:grid-cols-2",
              gapIn && "is-visible"
            )}
          >
            <div className="glass-panel-strong relative !rounded-[8px] overflow-hidden p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45">
                Today&apos;s reality
              </p>
              <h4 className="mt-2 text-xl font-medium tracking-tight md:text-2xl">
                Most plantation programs still run on:
              </h4>
              <ul className="mt-5 space-y-3">
                {blindSpots.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 text-[14px] font-light text-[var(--color-font)]/70"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px]"
                      style={{
                        background: "rgba(192,67,46,0.12)",
                        color: ALERT,
                      }}
                    >
                      ✕
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="relative overflow-hidden rounded-[8px] p-7 text-white"
              style={{
                background:
                  "linear-gradient(140deg, var(--verdan-green) 0%, #2f5d3e 100%)",
                boxShadow:
                  "0 30px 80px -30px rgba(var(--verdan-green-rgb), 0.55)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
                style={{ background: "rgba(255,255,255,0.25)" }}
              />
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
                What Harit changes
              </p>
              <h4 className="mt-2 text-xl font-medium tracking-tight md:text-2xl">
                Every tree, geolocated. Every site, monitored. Every survival
                rate, provable.
              </h4>
              <ul className="mt-6 space-y-3 text-[14px] font-light">
                {[
                  "Geospatial accountability for every planting site",
                  "Species-level growth & survival analytics",
                  "Drone + satellite verification, not selfies",
                  "Continuous lifecycle tracking, not annual reports",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-[6px] h-1.5 w-1.5 flex-none rounded-full bg-white"
                    />
                    <span className="text-white/95">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-[13px] font-light text-white/70">
                Because compensatory plantations are now expected to offset
                ecological damage, and without tracking, no one can prove
                restoration actually happened.
              </p>
            </div>
          </div>

          <p
            className={cn(
              "mt-14 text-center text-xl font-medium leading-snug tracking-tight md:mt-16 md:text-2xl",
              gapIn && "hero-animate-fade-slide-up-sm"
            )}
          >
            A tree not monitored is{" "}
            <span style={{ color: ALERT }}>a tree lost</span>.{" "}
            <span style={{ color: "var(--verdan-green)" }}>
              Harit makes sure it isn&apos;t.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
