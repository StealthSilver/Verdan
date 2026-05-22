"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";
import { BeginNowButton } from "@/components/ui/BeginNowButton";

const bullets = [
  "Geo-tagged plantation mapping with offline-first capture",
  "Photo-verified growth timelines for every tree",
  "Team coordination, task assignment and audit trails",
  "Shareable reports for funders, CSR and government bodies",
];

export default function Product() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="product"
      ref={ref}
      className="section-noise relative w-full overflow-hidden px-6 py-32 md:px-12 lg:px-20"
      style={{ background: "var(--background)" }}
    >
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Left — copy */}
        <div>
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-[12px] font-medium tracking-wide",
              visible && "hero-animate-fade-slide-up-sm"
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
            line1="One platform from"
            line2="sapling to canopy."
            className={cn("mt-5", visible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-md text-lg font-light leading-relaxed text-[var(--color-font)]/70",
              visible && "hero-animate-fade-slide-up-sm"
            )}
          >
            Harit gives plantation teams a mobile-first workspace and an
            executive dashboard — same data, two surfaces, zero spreadsheets.
          </p>

          <ul
            className={cn(
              "reveal-stagger mt-8 space-y-3.5",
              visible && "is-visible"
            )}
          >
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-[15px] font-light text-[var(--color-font)]/85"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--verdan-green)" }}
                />
                {b}
              </li>
            ))}
          </ul>

          <div
            className={cn(
              "mt-10",
              visible && "hero-animate-fade-slide-up-step4"
            )}
          >
            <BeginNowButton />
          </div>
        </div>

        {/* Right — product mock */}
        <div
          className={cn(
            "relative",
            visible && "hero-animate-fade-slide-topleft"
          )}
        >
          <div
            className="glass-panel-strong relative aspect-[4/5] w-full overflow-hidden p-6"
            style={{
              boxShadow:
                "0 40px 120px -40px rgba(var(--verdan-green-rgb), 0.45), 0 0 0 1px rgba(255,255,255,0.6) inset",
            }}
          >
            <div
              className="absolute inset-6 rounded-[20px] border bg-white/85 backdrop-blur-xl"
              style={{ borderColor: "rgba(0,0,0,0.05)" }}
            >
              <div
                className="flex items-center gap-1.5 border-b px-4 py-3"
                style={{ borderColor: "rgba(0,0,0,0.05)" }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-[11px] font-light text-[var(--color-font)]/40">
                  harit.app / dashboard
                </span>
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-font)]/40">
                    Active sites
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--verdan-green)" }}
                  >
                    +12 this week
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[42, 78, 91].map((v, i) => (
                    <div
                      key={i}
                      className="rounded-lg border p-3"
                      style={{
                        borderColor: "rgba(0,0,0,0.05)",
                        background: "rgba(var(--verdan-green-rgb), 0.04)",
                      }}
                    >
                      <div className="text-xs font-light text-[var(--color-font)]/55">
                        {["Survival", "Verified", "Coverage"][i]}
                      </div>
                      <div className="mt-1 text-xl font-light text-[var(--color-font)]">
                        {v}%
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: visible ? `${v}%` : "0%",
                            background: "var(--verdan-green)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-lg border p-3"
                  style={{
                    borderColor: "rgba(0,0,0,0.05)",
                    background: "rgba(var(--verdan-green-rgb), 0.04)",
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--color-font)]/40">
                      Recent captures
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--color-font)]/40">
                      <span className="hero-live-dot">
                        <span className="hero-live-dot__ripple" />
                        <span className="hero-live-dot__core" />
                      </span>
                      Live
                    </span>
                  </div>
                  {[
                    ["Block A-12", "Rajasthan", "2m ago"],
                    ["Block C-04", "Karnataka", "8m ago"],
                    ["Block F-21", "Assam", "14m ago"],
                  ].map(([a, b, c], i) => (
                    <div
                      key={a}
                      className={cn(
                        "flex items-center justify-between py-2 text-[12px] font-light",
                        i > 0 && "border-t"
                      )}
                      style={{ borderColor: "rgba(0,0,0,0.05)" }}
                    >
                      <span className="text-[var(--color-font)]">{a}</span>
                      <span className="text-[var(--color-font)]/55">{b}</span>
                      <span className="text-[var(--color-font)]/40">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* floating chip */}
          <div
            className="glass-panel-strong absolute -bottom-6 -left-6 hidden w-44 p-4 md:block"
            style={{
              boxShadow: "0 20px 50px -20px rgba(0,0,0,0.25)",
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-font)]/45">
              Field app
            </div>
            <div className="mt-1 text-sm font-light text-[var(--color-font)]">
              Offline capture ready
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="hero-live-dot">
                <span className="hero-live-dot__ripple" />
                <span className="hero-live-dot__core" />
              </span>
              <span
                className="text-[10px]"
                style={{ color: "var(--verdan-green)" }}
              >
                Synced
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
