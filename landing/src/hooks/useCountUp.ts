"use client";

import { useEffect, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export type UseCountUpParams = {
  end: number;
  decimals?: number;
  suffix?: string;
  isActive: boolean;
  durationMs: number;
  reducedMotion: boolean;
};

export function useCountUp({
  end,
  decimals = 0,
  suffix = "",
  isActive,
  durationMs,
  reducedMotion,
}: UseCountUpParams): string {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    if (reducedMotion) {
      setValue(end);
      return;
    }
    setValue(0);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(end * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isActive, reducedMotion, end, durationMs]);

  const core =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  return `${core}${suffix}`;
}
