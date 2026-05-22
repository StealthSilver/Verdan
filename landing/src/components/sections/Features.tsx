"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Camera,
  LineChart,
  Users,
  Shield,
  Smartphone,
  Cloud,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";

const features = [
  {
    icon: MapPin,
    title: "GPS plantation mapping",
    body: "Pin every sapling with sub-meter accuracy. Draw plots, blocks and zones directly from the field.",
    span: "md:col-span-2",
  },
  {
    icon: Camera,
    title: "Photo-verified growth",
    body: "Timestamped, geo-stamped images create a tamper-proof timeline per tree.",
  },
  {
    icon: LineChart,
    title: "Growth insights",
    body: "Survival curves, species mix and seasonal trends — generated automatically.",
  },
  {
    icon: Users,
    title: "Team coordination",
    body: "Assign tasks, review submissions, and keep field, supervisor and HQ aligned.",
  },
  {
    icon: Smartphone,
    title: "Offline-first mobile",
    body: "Capture in remote areas with zero connectivity. Sync the moment you're back online.",
    span: "md:col-span-2",
  },
  {
    icon: Shield,
    title: "Audit-grade records",
    body: "Every entry is immutable and traceable. Built for funders and regulators.",
  },
  {
    icon: FileBarChart,
    title: "One-click reports",
    body: "Generate CSR, ESG and government-ready PDFs from live data.",
  },
  {
    icon: Cloud,
    title: "Always-on cloud",
    body: "Your plantation data, mirrored and backed up. Accessible from anywhere.",
  },
];

export default function Features() {
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
      id="features"
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
            FEATURES
          </span>
          <PageHeadline
            line1="Everything a plantation"
            line2="actually needs."
            className={cn("mt-5", visible && "hero-animate-fade-slide-up")}
          />
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg font-light leading-relaxed text-[var(--color-font)]/70",
              visible && "hero-animate-fade-slide-up-sm"
            )}
          >
            Built with conservation NGOs, CSR teams and forest departments —
            for the messy, beautiful reality of working in the field.
          </p>
        </div>

        <div
          className={cn(
            "reveal-stagger grid grid-cols-1 gap-4 md:grid-cols-3",
            visible && "is-visible"
          )}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className={cn(
                "glass-panel-strong group relative overflow-hidden p-7 transition-all duration-500 hover:-translate-y-1",
                f.span
              )}
              style={{
                boxShadow:
                  "0 12px 50px -25px rgba(var(--verdan-green-rgb), 0.30)",
              }}
            >
              <div
                className="motion-feature-pulse absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl"
                style={{
                  background: "rgba(var(--verdan-green-rgb), 0.18)",
                }}
              />
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border"
                style={{
                  borderColor: "rgba(var(--verdan-green-rgb), 0.2)",
                  background: "rgba(var(--verdan-green-rgb), 0.10)",
                  color: "var(--verdan-green)",
                }}
              >
                <f.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="relative mt-5 text-xl font-normal text-[var(--color-font)]">
                {f.title}
              </h3>
              <p className="relative mt-2 text-[15px] font-light leading-relaxed text-[var(--color-font)]/70">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
