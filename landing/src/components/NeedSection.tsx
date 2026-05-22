"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";
import {
  landingAfterHeadline,
  landingClosing,
  landingNeedSectionPad,
  landingPanelStack,
  landingSectionPx,
  landingStackAfterLabel,
  landingStackBeforeGrid,
  landingStackMajor,
} from "@/lib/site-layout";
import {
  typeBody,
  typeBodyStrong,
  typeBodyMuted,
  typeBodyOnDark,
  typeBodyOnDarkBright,
  typeCallout,
  typeCaption,
  typeEyebrow,
  typeEyebrowLight,
  typeLeadCentered,
  typeListItem,
  typeMicro,
  typeSectionIntro,
  typeStatHero,
  typeStatLabel,
  typeStatSuffix,
  typeStatValue,
  typeTitleMedium,
} from "@/lib/typography";

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

function SectionIndex({ index, eyebrow }: { index: number; eyebrow: string }) {
  const num = String(index).padStart(2, "0");
  return (
    <div className={cn("flex items-center gap-2.5", typeEyebrow)}>
      <span className="font-mono">{num}</span>
      <span>{eyebrow}</span>
    </div>
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
        <span className={typeStatValue}>
          {prefix}
          {display}
        </span>
        <span className={typeStatSuffix}>{suffix}</span>
      </div>
      <p className={cn("relative mt-3", typeStatLabel)}>
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
      className={cn(
        "section-noise relative w-full overflow-hidden text-[var(--color-font)]",
        landingSectionPx,
        landingNeedSectionPad,
      )}
      style={{ background: "var(--background)" }}
    >
      <div className="relative z-[1] mx-auto w-full max-w-7xl">
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
              typeSectionIntro,
              headVisible && "hero-animate-fade-slide-up-sm"
            )}
          >
            Governments, corporates and NGOs spend billions on afforestation each
            year yet plantation success is still measured by trees planted, not
            trees surviving. That single gap
            changes everything.
          </p>
        </div>

        {/* Act 1 — Accountability crisis */}
        <div ref={statsRef} className={landingAfterHeadline}>
          <SectionIndex
            index={1}
            eyebrow="The plantation accountability crisis"
          />
          <p
            className={cn(
              "max-w-2xl",
              landingStackAfterLabel,
              typeBodyStrong,
              statsIn && "hero-animate-fade-slide-up-sm",
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
              cn("reveal-stagger grid gap-4 md:grid-cols-3", landingStackBeforeGrid),
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
              cn(
                "glass-panel-strong !rounded-[8px] overflow-hidden p-6 md:p-8",
                landingPanelStack,
              ),
              statsIn && "hero-animate-fade-slide-up-sm"
            )}
            style={{
              boxShadow: "0 18px 60px -28px rgba(var(--verdan-green-rgb), 0.28)",
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className={typeEyebrow}>TerraFund survival thresholds</p>
                <p className={cn("mt-2", typeBodyStrong)}>
                  Below <strong style={{ color: ALERT }}>70%</strong> a restoration
                  project is considered <strong className="font-normal">at risk</strong>.
                  Below <strong style={{ color: WARN }}>80%</strong> requires
                  intervention.
                </p>
              </div>
              <div className="text-right">
                <div className={typeStatHero} style={{ color: "var(--verdan-green)" }}>
                  {Math.round(survival)}%
                </div>
                <div className={typeCaption}>
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
            <div className={cn("mt-2 flex justify-between", typeMicro)}>
              <span>0%</span>
              <span style={{ color: ALERT }}>at risk · 70%</span>
              <span style={{ color: WARN }}>intervention · 80%</span>
              <span>100%</span>
            </div>

            <p className={cn("mt-6", typeBodyMuted)}>
              &ldquo;A tree not monitored is usually a tree lost.&rdquo;
            </p>
          </div>

          <div
            className={cn(
              "mt-6 flex items-center gap-2.5",
              typeBodyMuted,
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
        <div ref={ironyRef} className={landingStackMajor}>
          <SectionIndex
            index={2}
            eyebrow="Renewable energy&apos;s hidden contradiction"
          />

          <div
            className={cn(
              "grid gap-8 md:grid-cols-12 md:gap-6",
              landingStackAfterLabel,
            )}
          >
            <div
              className={cn(
                "md:col-span-5",
                ironyIn && "hero-animate-fade-slide-up"
              )}
            >
              <h4 className={typeCallout}>
                To build{" "}
                <span className="text-[var(--color-font)]">clean energy</span>,
                ecosystems are being cleared at industrial scale.
              </h4>
              <p className={cn(landingStackAfterLabel, typeBody)}>
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
        <div ref={gapRef} className={landingStackMajor}>
          <SectionIndex
            index={3}
            eyebrow="Planting is easy. Proving survival is hard."
          />

          <div
            className={cn(
              cn("reveal-stagger grid gap-5 md:grid-cols-2", landingStackBeforeGrid),
              gapIn && "is-visible"
            )}
          >
            <div className="glass-panel-strong relative !rounded-[8px] overflow-hidden p-7">
              <p className={typeEyebrow}>Today&apos;s reality</p>
              <h4 className={cn("mt-2", typeTitleMedium)}>
                Most plantation programs still run on:
              </h4>
              <ul className="mt-5 space-y-3">
                {blindSpots.map((b) => (
                  <li
                    key={b}
                    className={typeListItem}
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
              className="relative overflow-hidden rounded-[8px] bg-[var(--verdan-green)] p-7 text-white"
              style={{
                boxShadow:
                  "0 30px 80px -30px rgba(var(--verdan-green-rgb), 0.55)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
                style={{ background: "rgba(255,255,255,0.25)" }}
              />
              <p className={typeEyebrowLight}>What Harit changes</p>
              <h4 className={cn("mt-2", typeTitleMedium, "text-white")}>
                Every tree, geolocated. Every site, monitored. Every survival
                rate, provable.
              </h4>
              <ul className="mt-6 space-y-3">
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
                    <span className={typeBodyOnDarkBright}>{t}</span>
                  </li>
                ))}
              </ul>
              <p className={cn("mt-7", typeBodyOnDark)}>
                Because compensatory plantations are now expected to offset
                ecological damage, and without tracking, no one can prove
                restoration actually happened.
              </p>
            </div>
          </div>

          <p
            className={cn(
              landingClosing,
              typeLeadCentered,
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
