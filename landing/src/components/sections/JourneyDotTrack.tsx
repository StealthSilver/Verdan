"use client";

import { cn } from "@/lib/utils";

export const JOURNEY_STEP_COUNT = 6;
export const JOURNEY_CYCLE_MS = 4920;

type JourneyDotTrackProps = {
  active?: boolean;
};

export function JourneyDotTrack({ active = false }: JourneyDotTrackProps) {
  return (
    <div className="journey-dot-track" aria-hidden>
      <div className="journey-dot-line journey-dot-line--base" />
      <div
        className={cn(
          "journey-dot-line journey-dot-line--pulse",
          active && "is-running",
        )}
      />
    </div>
  );
}
