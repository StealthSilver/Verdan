"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, FileX, MapPinOff, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";

const pains = [
  {
    icon: MapPinOff,
    title: "No ground truth",
    body: "Plantation records live in spreadsheets and WhatsApp groups. Nobody actually knows what's standing in the field.",
  },
  {
    icon: FileX,
    title: "Reports without proof",
    body: "Survival rates are reported, never verified. Funders, auditors and CSR teams have to take it on trust.",
  },
  {
    icon: Users2,
    title: "Teams working blind",
    body: "Field staff, supervisors and project leads each see a different version of the same plantation.",
  },
  {
    icon: AlertTriangle,
    title: "Impact disappears",
    body: "Years of effort vanish when there's no continuous record of where trees were planted and how they grew.",
  },
];

export default function NeedSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="the-need"
      ref={ref}
      className="section-noise relative w-full px-6 py-28 md:px-12 lg:px-20"
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
            THE NEED
          </span>
          <PageHeadline
            line1="Plantations are growing."
            line2="Visibility isn't."
            className={cn("mt-5", visible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg font-light leading-relaxed text-[var(--color-font)]/70",
              visible && "hero-animate-fade-slide-up-sm"
            )}
          >
            Every year millions of saplings go into the ground. A fraction get
            tracked. Almost none get verified at scale. Here&apos;s what stands
            between effort and real, measurable impact.
          </p>
        </div>

        <div
          className={cn(
            "reveal-stagger grid grid-cols-1 gap-5 md:grid-cols-2",
            visible && "is-visible"
          )}
        >
          {pains.map((p) => (
            <div
              key={p.title}
              className="glass-panel-strong group relative overflow-hidden p-7 transition-all duration-500 hover:-translate-y-1"
              style={{
                boxShadow:
                  "0 10px 40px -20px rgba(var(--verdan-green-rgb), 0.25)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(var(--verdan-green-rgb), 0.55), transparent)",
                }}
              />
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(var(--verdan-green-rgb), 0.12)",
                  color: "var(--verdan-green)",
                }}
              >
                <p.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-xl font-normal text-[var(--color-font)]">
                {p.title}
              </h3>
              <p className="mt-2 text-[15px] font-light leading-relaxed text-[var(--color-font)]/70">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
