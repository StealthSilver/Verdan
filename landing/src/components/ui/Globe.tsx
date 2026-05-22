"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";

import {
  GLOBE_SATELLITE_MARKERS,
  GLOBE_SATELLITE_SIZE,
} from "@/lib/globeMarkers";

const VERDAN_RGB: [number, number, number] = [
  72 / 255,
  132 / 255,
  92 / 255,
];
import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

const SATELLITE_ANCHOR_COLOR: [number, number, number] = [0.92, 0.97, 0.94];

function buildMarkers() {
  return GLOBE_SATELLITE_MARKERS.map((m) => ({
    location: m.location,
    size: GLOBE_SATELLITE_SIZE,
    id: m.id,
    color: SATELLITE_ANCHOR_COLOR,
  }));
}

export const VERDAN_GLOBE_CONFIG: COBEOptions = {
  devicePixelRatio: 1.5,
  width: 600,
  height: 600,
  phi: 0,
  theta: 0.2,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 10000,
  mapBrightness: 6,
  baseColor: [0.97, 0.99, 0.96],
  markerColor: VERDAN_RGB,
  glowColor: [0.86, 0.94, 0.88],
  markerElevation: 0.14,
  markers: buildMarkers(),
  arcColor: VERDAN_RGB,
  arcWidth: 0.35,
  arcHeight: 0.22,
};

export function Globe({
  className,
  config = VERDAN_GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerStart = useRef(0);
  const phiOffset = useRef(0);
  const phi = useRef(0);
  const runningRef = useRef(false);
  const animationIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth;
    const dpr = Math.min(config.devicePixelRatio ?? 1.5, 2);

    const onResize = () => {
      width = canvas.offsetWidth;
    };

    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      ...config,
      width: width * dpr,
      height: width * dpr,
      markers: buildMarkers(),
    });

    const fadeTimer = window.setTimeout(() => {
      canvas.style.opacity = "1";
    }, 0);

    const animate = () => {
      if (!runningRef.current) return;
      if (pointerInteracting.current === null) {
        phi.current += 0.005;
      }
      globe.update({
        phi: phi.current + phiOffset.current,
        width: width * dpr,
        height: width * dpr,
      });
      animationIdRef.current = requestAnimationFrame(animate);
    };

    const start = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      animate();
    };

    const stop = () => {
      runningRef.current = false;
      cancelAnimationFrame(animationIdRef.current);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      },
      { threshold: 0.05, rootMargin: "120px" },
    );

    if (container) observer.observe(container);
    else start();

    return () => {
      observer.disconnect();
      window.clearTimeout(fadeTimer);
      stop();
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config]);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerStart.current;
      pointerStart.current = clientX;
      phiOffset.current += delta / MOVEMENT_DAMPING;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[min(100%,280px)]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="size-full cursor-grab opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        onPointerDown={(e) => {
          pointerStart.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
      {GLOBE_SATELLITE_MARKERS.map((sat) => (
        <div
          key={sat.id}
          className="globe-satellite"
          aria-hidden
          style={
            {
              positionAnchor: `--cobe-${sat.id}`,
              opacity: `var(--cobe-visible-${sat.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${sat.id}, 0)) * 6px))`,
            } as React.CSSProperties
          }
        >
          🛰️
        </div>
      ))}
    </div>
  );
}
