"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, TreePine, MapPinned, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";

const stats = [
  { icon: TreePine, value: "1.2M+", label: "Trees tracked" },
  { icon: MapPinned, value: "340", label: "Active sites" },
  { icon: Users, value: "85+", label: "Partner orgs" },
  { icon: ShieldCheck, value: "94%", label: "Avg. survival verified" },
];

const testimonials = [
  {
    quote:
      "We went from spreadsheets and guesswork to verified, photo-backed survival numbers our donors actually trust. Harit changed how we report impact.",
    name: "Aanya Mehta",
    role: "Program Director, GreenRoots Foundation",
  },
  {
    quote:
      "Field teams adopted it in a week. The offline app just works — even in interior Jharkhand where nothing else does.",
    name: "Rohan Iyer",
    role: "Operations Lead, EarthCorps India",
  },
  {
    quote:
      "Auditing CSR plantation claims used to take months. With Harit's trails, we close reviews in days.",
    name: "Karthik Reddy",
    role: "ESG Manager, Indus Sustainability",
  },
];

const logos = [
  "GreenRoots",
  "EarthCorps",
  "Indus ESG",
  "TerraWild",
  "Vanya",
  "BioBharat",
];

export default function Proof() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="proof"
      ref={ref}
      className="section-noise relative w-full overflow-hidden px-6 py-32 md:px-12 lg:px-20"
      style={{ background: "var(--background)" }}
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 max-w-3xl">
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-[12px] font-medium tracking-wide backdrop-blur",
              visible && "hero-animate-fade-slide-up-sm"
            )}
            style={{
              borderColor: "rgba(var(--verdan-green-rgb), 0.25)",
              background: "rgba(255,255,255,0.6)",
              color: "var(--verdan-green)",
            }}
          >
            PROOF
          </span>
          <PageHeadline
            line1="Real ground."
            line2="Real numbers."
            className={cn("mt-5", visible && "hero-animate-fade-slide-up")}
          />
        </div>

        {/* Stats */}
        <div
          className={cn(
            "reveal-stagger grid grid-cols-2 gap-4 md:grid-cols-4",
            visible && "is-visible"
          )}
        >
          {stats.map((s) => (
            <div key={s.label} className="glass-panel-strong p-6">
              <s.icon
                className="h-5 w-5"
                style={{ color: "var(--verdan-green)" }}
                strokeWidth={1.5}
              />
              <div className="mt-4 text-3xl font-light tracking-tight text-[var(--color-font)] md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-[13px] font-light text-[var(--color-font)]/55">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div
          className={cn(
            "reveal-stagger mt-12 grid grid-cols-1 gap-5 md:grid-cols-3",
            visible && "is-visible"
          )}
        >
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="glass-panel-strong group relative flex flex-col p-7 transition-all duration-500 hover:-translate-y-1"
              style={{
                boxShadow:
                  "0 18px 60px -25px rgba(var(--verdan-green-rgb), 0.35)",
              }}
            >
              <Quote
                className="h-6 w-6"
                style={{ color: "rgba(var(--verdan-green-rgb), 0.45)" }}
                strokeWidth={1.5}
              />
              <blockquote className="mt-4 flex-1 text-[15px] font-light leading-relaxed text-[var(--color-font)]/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption
                className="mt-6 border-t pt-4"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                <div className="text-sm font-normal text-[var(--color-font)]">
                  {t.name}
                </div>
                <div className="text-[12px] font-light text-[var(--color-font)]/55">
                  {t.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Logos */}
        <div
          className={cn(
            "mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t pt-10",
            visible && "hero-animate-fade-slide-up-sm"
          )}
          style={{ borderColor: "rgba(0,0,0,0.06)" }}
        >
          <span className="w-full text-center text-[11px] uppercase tracking-[0.2em] text-[var(--color-font)]/40">
            Trusted by teams planting at scale
          </span>
          {logos.map((l) => (
            <span
              key={l}
              className="text-base font-light tracking-tight text-[var(--color-font)]/40 transition-colors"
              style={{ transitionDuration: "300ms" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--verdan-green)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "")
              }
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
