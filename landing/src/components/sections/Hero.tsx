"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FallingLeaves from "@/components/FallingLeaves";
import { HeroDashboardScene } from "@/components/HeroDashboardScene";
import { cn } from "@/lib/utils";
import { PageHeadline } from "@/components/ui/PageHeadline";
import {
  landingHeroBottomPad,
  landingHeroDashboardGap,
  landingHeroSubtextGap,
  landingHeroTopPad,
  landingSectionPx,
} from "@/lib/site-layout";
import { typeHeroSubtext } from "@/lib/typography";

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
      className={cn(
        "relative flex min-h-screen w-full flex-col justify-start bg-[var(--background)] text-[var(--color-font)] transition-colors duration-500",
        landingSectionPx,
        landingHeroTopPad,
        landingHeroBottomPad,
      )}
    >
      <FallingLeaves className="hero-falling-leaves" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start text-left">
        <div
          className={cn(
            step < 1 && "hero-pre-animate",
            step >= 1 && "hero-animate-fade-slide-up"
          )}
        >
          <PageHeadline
            line1="Plantation Monitoring and Management,"
            line2="Easier Than Ever"
          />
        </div>

        <div
          className={cn(
            "flex w-full flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
            landingHeroSubtextGap,
          )}
        >
          <p
            className={cn(
              "max-w-2xl",
              typeHeroSubtext,
              step < 2 && "hero-pre-animate",
              step >= 2 && "hero-animate-fade-slide-up-sm"
            )}
          >
            Track plantations with GPS, photos, growth insights, and team
            coordination
          </p>
          <Link
            href="/"
            className={cn(
              "group flex shrink-0 items-center gap-2 transition-colors duration-150 hover:text-black",
              typeHeroSubtext,
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
          </Link>
        </div>
      </div>

      <HeroDashboardScene
        className={cn(
          landingHeroDashboardGap,
          step < 3 && "hero-pre-animate",
          step >= 3 && "hero-animate-fade-slide-topleft",
        )}
      />
    </section>
  );
};

export default Hero;
