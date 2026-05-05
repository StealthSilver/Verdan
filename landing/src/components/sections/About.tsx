"use client";

import { Leaf, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

const pillars = [
  {
    label: "Purpose",
    text: "Plant with intent—so every seedling ties back to the outcome you promised.",
    icon: Leaf,
  },
  {
    label: "Precision",
    text: "Record, photograph, and follow each tree so progress stays measurable, not assumed.",
    icon: Target,
  },
  {
    label: "Proof",
    text: "Give teams and stakeholders one clear story: from first planting to mature canopy.",
    icon: Shield,
  },
];

const About = () => {
  const { ref: topRef, isInView: topVisible } = useInView<HTMLDivElement>();
  const { ref: cardsRef, isInView: cardsVisible } = useInView<HTMLDivElement>();

  return (
    <section
      id="about"
      className={cn(
        "section-noise relative w-full overflow-hidden bg-[var(--background)] py-20 text-[var(--color-font)] sm:py-24 md:py-28 lg:py-36",
        "font-[family-name:var(--font-dm-sans)]"
      )}
    >
      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={topRef}
          className={cn(
            "reveal-fade mx-auto max-w-3xl text-center",
            topVisible && "is-visible"
          )}
        >
          <h2 className="mb-4 text-sm font-light tracking-widest text-[var(--color-font)]/50 sm:text-base md:text-lg">
            About
          </h2>
          <h3 className="mb-5 text-2xl font-semibold leading-snug text-[rgb(74,137,92)] sm:mb-6 sm:text-3xl md:text-4xl">
            Accountability for every tree you plant
          </h3>
          <p className="text-base leading-relaxed text-[var(--color-font)]/80 sm:text-lg md:text-xl">
            Harit helps organizations and individuals plant with purpose, track
            with precision, and show impact that holds up to scrutiny.
          </p>

          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-left sm:mt-12 sm:space-y-7">
            <p className="text-base leading-relaxed text-[var(--color-font)]/80 sm:text-lg">
              Traditional planting programs often lose signal in the field:
              spreadsheets, one-off photos, and handoffs that make it hard to
              prove what grew—and what did not.
            </p>
            <p className="text-base leading-relaxed text-[var(--color-font)]/80 sm:text-lg">
              We built Harit as a single place to document each tree, revisit it
              over time, and turn that trail into a credible narrative for your
              team and your community.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-5xl text-center sm:mt-16 md:mt-20">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[rgb(74,137,92)] sm:text-sm">
            How we think
          </p>
          <div
            ref={cardsRef}
            className={cn(
              "reveal-stagger mt-6 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-3 md:gap-5",
              cardsVisible && "is-visible"
            )}
          >
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex flex-col items-center gap-4 rounded-[24px] border border-black/[0.08] bg-white p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:p-6",
                    "transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)",
                    "hover:-translate-y-0.5 hover:border-[rgb(74,137,92)]/35 hover:shadow-[0_12px_40px_rgba(74,137,92,0.15)]"
                  )}
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[rgb(74,137,92)]/25 bg-[rgb(74,137,92)]/10 text-[rgb(74,137,92)]"
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-font)] sm:text-base">
                      {item.label}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-font)]/70 sm:text-base">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
