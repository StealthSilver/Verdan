"use client";

import { useEffect, useState } from "react";
import FallingLeaves from "@/components/FallingLeaves";
import HeroDashboard from "@/components/HeroDashboard";
import { cn } from "@/lib/utils";

/** Step 1 headline — 200ms delay, 700ms duration */
const STEP1_DELAY = 200;
/** Step 2 subtext — 400ms after step 1 starts */
const STEP2_DELAY = STEP1_DELAY + 400;
/** Step 3 dashboard — 300ms after step 2 starts */
const STEP3_DELAY = STEP2_DELAY + 300;
/** Step 4 mobile line — after dashboard (900ms) completes */
const STEP4_DELAY = STEP3_DELAY + 900;

type AnimationStep = 0 | 1 | 2 | 3 | 4;

const Hero = () => {
  const [step, setStep] = useState<AnimationStep>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setStep(4);
      return;
    }

    const timers = [
      setTimeout(() => setStep(1), STEP1_DELAY),
      setTimeout(() => setStep(2), STEP2_DELAY),
      setTimeout(() => setStep(3), STEP3_DELAY),
      setTimeout(() => setStep(4), STEP4_DELAY),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section
      id="product"
      className="relative flex w-full flex-col justify-start bg-[var(--background)] px-3 pt-[4.25rem] pb-12 text-[var(--color-font)] transition-colors duration-500 sm:px-5 sm:pb-16 sm:pt-[16.25rem] lg:pb-20"
    >
      <FallingLeaves className="hero-falling-leaves" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start text-left">
        <div
          className={cn(
            step < 1 && "hero-pre-animate",
            step >= 1 && "hero-animate-fade-slide-up"
          )}
        >
          <h1 className="text-[1.75rem] font-semibold leading-[1.1] sm:text-[2.125rem] md:text-[2.375rem] lg:text-[3.25rem]">
            Plantation Monitoring and Management,
          </h1>
          <h2 className="mt-0.5 text-[1.75rem] font-semibold leading-[1.1] sm:mt-1 sm:text-[2.125rem] md:text-[2.375rem] lg:text-[3.25rem]">
            Easier Than Ever
          </h2>
        </div>

        <div className="mt-4 flex w-full flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:mt-5">
          <p
            className={cn(
              "max-w-2xl text-[14px] font-light leading-snug text-gray-600",
              step < 2 && "hero-pre-animate",
              step >= 2 && "hero-animate-fade-slide-up-sm"
            )}
          >
            Track plantations with GPS, photos, growth insights, and team
            coordination
          </p>
          <p
            className={cn(
              "group flex shrink-0 cursor-default items-center gap-2 text-[14px] font-light leading-snug text-gray-600 transition-colors duration-150 hover:text-black",
              step < 4 && "hero-pre-animate",
              step >= 4 && "hero-animate-fade-slide-up-step4"
            )}
          >
            <span className="hero-live-dot" aria-hidden>
              <span className="hero-live-dot__ripple" />
              <span className="hero-live-dot__ripple" />
              <span className="hero-live-dot__core" />
            </span>
            We built a mobile application
            <svg
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-[0.85em] w-[0.85em] shrink-0 [&_path:first-child]:opacity-0 [&_path:first-child]:transition-opacity [&_path:first-child]:duration-300 [&_path:first-child]:ease-[cubic-bezier(0.25,1,0.5,1)] [&_path:last-child]:transition-transform [&_path:last-child]:duration-300 [&_path:last-child]:ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:[&_path:first-child]:opacity-100 group-hover:[&_path:last-child]:translate-x-[3px]"
            >
              <path d="M0.5 5.5h7" />
              <path d="M1.5 1.5l4 4-4 4" />
            </svg>
          </p>
        </div>
      </div>

      <div
        className={cn(
          "hero-dashboard-scene relative z-10 mt-11 w-full sm:mt-14 lg:mt-16",
          step < 3 && "hero-pre-animate",
          step >= 3 && "hero-animate-fade-slide-topleft"
        )}
      >
        <div className="hero-dashboard-page-gradient" aria-hidden />
        <div className="hero-dashboard-elevated relative z-[1] mx-auto w-full max-w-[85rem] overflow-visible px-3 sm:px-5">
          <div className="hero-dashboard-effects" aria-hidden>
            <div className="hero-dashboard-glow" />
          </div>
          <div className="hero-dashboard-corner-shadows" aria-hidden>
            <div className="hero-dashboard-floor-shadow" />
            <div className="hero-dashboard-corner-shadow hero-dashboard-corner-shadow--left" />
            <div className="hero-dashboard-corner-shadow hero-dashboard-corner-shadow--right" />
          </div>
          <div className="hero-dashboard-panel-wrap relative z-[1]">
            <div className="hero-dashboard-rim-light" aria-hidden />
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
