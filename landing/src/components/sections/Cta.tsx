"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const Cta = () => {
  const { ref: statsRef, isInView: statsVisible } = useInView<HTMLDivElement>({
    once: true,
    threshold: 0.25,
  });
  const reducedMotion = usePrefersReducedMotion();

  const treesDisplay = useCountUp({
    end: 1000,
    suffix: "+",
    isActive: statsVisible,
    durationMs: 1800,
    reducedMotion,
  });
  const orgsDisplay = useCountUp({
    end: 10,
    suffix: "+",
    isActive: statsVisible,
    durationMs: 1500,
    reducedMotion,
  });
  const uptimeDisplay = useCountUp({
    end: 99.9,
    decimals: 1,
    suffix: "%",
    isActive: statsVisible,
    durationMs: 1700,
    reducedMotion,
  });

  return (
    <section
      id="cta"
      className={cn(
        "relative w-full overflow-hidden bg-[var(--background)] py-20 text-[var(--color-font)] sm:py-24 md:py-28 lg:py-36",
        "font-[family-name:var(--font-dm-sans)]"
      )}
    >
      <div className="relative z-[1] mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          ref={statsRef}
          className={cn(
            "mx-auto max-w-4xl rounded-[1.75rem] border border-black/[0.08] bg-white px-6 py-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:px-10 sm:py-14 md:px-12 md:py-16",
            "transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)"
          )}
        >
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgb(74,137,92)]/25 bg-[rgb(74,137,92)]/10 px-4 py-2 sm:mb-8 sm:px-5 sm:py-2.5"
          >
            <Sparkles
              className="h-4 w-4 text-[rgb(74,137,92)] sm:h-5 sm:w-5"
              aria-hidden
            />
            <span className="text-xs font-semibold text-[rgb(74,137,92)] sm:text-sm">
              Ready to make an impact?
            </span>
          </div>

          <h2 className="mb-4 text-3xl font-semibold leading-tight text-[rgb(74,137,92)] sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Start Planting with Purpose Today
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-[var(--color-font)]/80 sm:mb-12 sm:text-lg md:text-xl">
            Join thousands of organizations using Harit to track, measure, and
            celebrate their tree-planting impact. Get started free today.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="https://verdan-beige.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative w-full overflow-hidden rounded-full border border-[rgb(74,137,92)]/45 bg-white px-7 py-3.5 text-center text-sm font-semibold text-gray-900 shadow-[0_8px_32px_rgba(0,0,0,0.1)] sm:w-auto sm:px-8 sm:py-4 sm:text-base",
                "outline-none transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)",
                "hover:-translate-y-0.5 hover:border-[rgb(74,137,92)]/65 hover:shadow-[0_10px_36px_rgba(74,137,92,0.25)]",
                "focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/45"
              )}
            >
              <span className="relative inline-flex items-center justify-center">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </span>
            </Link>

            <Link
              href="/#about"
              className={cn(
                "w-full rounded-full border border-black/[0.12] bg-[var(--background)] px-7 py-3.5 text-center text-sm font-semibold text-gray-900 shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:w-auto sm:px-8 sm:py-4 sm:text-base",
                "outline-none transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)",
                "hover:-translate-y-0.5 hover:border-[rgb(74,137,92)]/35 hover:bg-white hover:text-[rgb(74,137,92)]",
                "focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/35"
              )}
            >
              Learn More
            </Link>
          </div>

          <p className="mt-12 text-xs font-semibold uppercase tracking-wide text-[var(--color-font)]/55 sm:mt-14">
            Trusted by leading organizations
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-4 border-t border-black/[0.08] pt-8 sm:mt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-0 sm:pt-10">
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-[var(--background)] px-4 py-3 sm:rounded-full sm:py-3.5">
              <span className="text-2xl font-bold text-[rgb(74,137,92)] sm:text-3xl">
                {treesDisplay}
              </span>
              <span className="mt-1 max-w-[10rem] text-center text-xs text-[var(--color-font)]/70 sm:text-sm">
                Trees planted and tracked
              </span>
            </div>
            <div
              className="hidden h-12 w-px shrink-0 bg-[rgba(0,0,0,0.08)] sm:block"
              aria-hidden
            />
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-[var(--background)] px-4 py-3 sm:rounded-full sm:py-3.5">
              <span className="text-2xl font-bold text-[rgb(74,137,92)] sm:text-3xl">
                {orgsDisplay}
              </span>
              <span className="mt-1 max-w-[10rem] text-center text-xs text-[var(--color-font)]/70 sm:text-sm">
                Organizations on Harit
              </span>
            </div>
            <div
              className="hidden h-12 w-px shrink-0 bg-[rgba(0,0,0,0.08)] sm:block"
              aria-hidden
            />
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-[var(--background)] px-4 py-3 sm:rounded-full sm:py-3.5">
              <span className="text-2xl font-bold text-[rgb(74,137,92)] sm:text-3xl">
                {uptimeDisplay}
              </span>
              <span className="mt-1 max-w-[10rem] text-center text-xs text-[var(--color-font)]/70 sm:text-sm">
                Data availability
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
