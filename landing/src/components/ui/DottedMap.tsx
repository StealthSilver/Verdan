"use client";

import * as React from "react";
import { createMap } from "svg-dotted-map";

import { Sprout, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Marker {
  lat: number;
  lng: number;
  size?: number;
  pulse?: boolean;
  /** When set, a status drawer is shown above this pulsing spot */
  statusLabel?: string;
  /** Drives the growth icon shown in the status drawer */
  statusKind?: "verified" | "sites";
}

type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & {
  x: number;
  y: number;
};

type Dot = { x: number; y: number };

type MapTransform = {
  renderW: number;
  renderH: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

export interface DottedMapProps<M extends Marker = Marker>
  extends React.HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
  mapSamples?: number;
  markers?: M[];
  dotColor?: string;
  hoverDotColor?: string;
  markerColor?: string;
  dotRadius?: number;
  hoverRadius?: number;
  stagger?: boolean;
  pulse?: boolean;

  renderMarkerOverlay?: (args: {
    marker: MapMarker<M>;
    index: number;
    x: number;
    y: number;
    r: number;
  }) => React.ReactNode;
}

function resolveColor(color: string, el: HTMLElement): string {
  const trimmed = color.trim();
  if (!trimmed.startsWith("var(")) return trimmed;
  const prop = trimmed.slice(4, -1).trim();
  return getComputedStyle(el).getPropertyValue(prop).trim() || trimmed;
}

function getMapTransform(
  rect: DOMRect,
  viewW: number,
  viewH: number
): MapTransform {
  const containerAspect = rect.width / rect.height;
  const viewAspect = viewW / viewH;
  let renderW: number;
  let renderH: number;
  let offsetX: number;
  let offsetY: number;

  if (containerAspect > viewAspect) {
    renderH = rect.height;
    renderW = renderH * viewAspect;
    offsetX = (rect.width - renderW) / 2;
    offsetY = 0;
  } else {
    renderW = rect.width;
    renderH = renderW / viewAspect;
    offsetX = 0;
    offsetY = (rect.height - renderH) / 2;
  }

  return { renderW, renderH, offsetX, offsetY, scale: renderW / viewW };
}

function viewBoxToCanvas(x: number, y: number, t: MapTransform) {
  return { px: t.offsetX + x * t.scale, py: t.offsetY + y * t.scale };
}

function canvasToViewBox(px: number, py: number, t: MapTransform) {
  return { x: (px - t.offsetX) / t.scale, y: (py - t.offsetY) / t.scale };
}

function buildStaggerMeta(points: { x: number; y: number }[], stagger: boolean) {
  const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x);
  const yToRowIndex = new Map<number, number>();
  let xStep = 1;
  let prevY = Number.NaN;
  let prevXInRow = Number.NaN;

  for (const p of sorted) {
    if (p.y !== prevY) {
      prevY = p.y;
      prevXInRow = Number.NaN;
      if (!yToRowIndex.has(p.y)) yToRowIndex.set(p.y, yToRowIndex.size);
    }
    if (!Number.isNaN(prevXInRow)) {
      const delta = p.x - prevXInRow;
      if (delta > 0) xStep = xStep === 1 ? delta : Math.min(xStep, delta);
    }
    prevXInRow = p.x;
  }

  const dots: Dot[] = points.map((point) => {
    const rowIndex = yToRowIndex.get(point.y) ?? 0;
    const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
    return { x: point.x + offsetX, y: point.y };
  });

  return { dots, xStep };
}

function buildSpatialGrid(dots: Dot[], cellSize: number) {
  const grid = new Map<string, number[]>();
  for (let i = 0; i < dots.length; i++) {
    const key = `${Math.floor(dots[i].x / cellSize)},${Math.floor(dots[i].y / cellSize)}`;
    const bucket = grid.get(key);
    if (bucket) bucket.push(i);
    else grid.set(key, [i]);
  }
  return grid;
}

function getNearbyDotIndices(
  hx: number,
  hy: number,
  dots: Dot[],
  grid: Map<string, number[]>,
  cellSize: number,
  radiusSq: number
): number[] {
  const cx = Math.floor(hx / cellSize);
  const cy = Math.floor(hy / cellSize);
  const result: number[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bucket = grid.get(`${cx + dx},${cy + dy}`);
      if (!bucket) continue;
      for (const i of bucket) {
        const dot = dots[i];
        const distSq = (dot.x - hx) ** 2 + (dot.y - hy) ** 2;
        if (distSq <= radiusSq) result.push(i);
      }
    }
  }

  return result;
}

type DrawerLayout = {
  id: number;
  left: number;
  top: number;
  label: string;
  kind: "verified" | "sites";
};

function StatusGrowthIcon({ kind }: { kind: "verified" | "sites" }) {
  const className = "h-3.5 w-3.5 shrink-0 text-[var(--verdan-green)]";
  if (kind === "verified") {
    return <Sprout className={className} strokeWidth={2} aria-hidden />;
  }
  return <TrendingUp className={className} strokeWidth={2} aria-hidden />;
}

function MapStatusDrawer({
  label,
  kind,
  left,
  top,
  delayMs,
}: {
  label: string;
  kind: "verified" | "sites";
  left: number;
  top: number;
  delayMs: number;
}) {
  return (
    <div
      className="cta-status-drawer pointer-events-none absolute z-20 flex flex-col items-center"
      style={{
        left,
        top,
        animationDelay: `${delayMs}ms`,
      }}
    >
      <div className="cta-status-drawer__card">
        <StatusGrowthIcon kind={kind} />
        <span>{label}</span>
      </div>
      <span className="cta-status-drawer__caret" aria-hidden />
    </div>
  );
}

export function DottedMap<M extends Marker = Marker>({
  width = 150,
  height = 75,
  mapSamples = 5000,
  markers = [],
  dotColor = "currentColor",
  hoverDotColor = "var(--verdan-green)",
  markerColor = "#FF6900",
  dotRadius = 0.2,
  hoverRadius = 11,
  stagger = true,
  pulse = false,
  renderMarkerOverlay,
  className,
  style,
  onMouseMove,
  onMouseLeave,
  ...divProps
}: DottedMapProps<M>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const baseCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const pendingPointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const colorsRef = React.useRef({ dot: dotColor, hover: hoverDotColor });
  const transformRef = React.useRef<MapTransform | null>(null);
  const [drawerLayouts, setDrawerLayouts] = React.useState<DrawerLayout[]>([]);

  const mapData = React.useMemo(() => {
    const { points, addMarkers } = createMap({ width, height, mapSamples });
    const { dots } = buildStaggerMeta(points, stagger);
    const grid = buildSpatialGrid(dots, hoverRadius);
    return {
      dots,
      processedMarkers: addMarkers(markers),
      grid,
    };
  }, [width, height, mapSamples, markers, stagger, hoverRadius]);

  const { dots, processedMarkers, grid } = mapData;
  const hoverRadiusSq = hoverRadius * hoverRadius;

  const syncCanvasSize = React.useCallback(
    (canvas: HTMLCanvasElement, rect: DOMRect) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
      return dpr;
    },
    []
  );

  const drawBaseLayer = React.useCallback(() => {
    const container = containerRef.current;
    const canvas = baseCanvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = syncCanvasSize(canvas, rect);
    const transform = getMapTransform(rect, width, height);
    transformRef.current = transform;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = resolveColor(colorsRef.current.dot, container);

    const radiusPx = dotRadius * transform.scale;

    for (const dot of dots) {
      const { px, py } = viewBoxToCanvas(dot.x, dot.y, transform);
      ctx.beginPath();
      ctx.arc(px, py, radiusPx, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [dots, dotRadius, width, height, syncCanvasSize]);

  const drawHoverLayer = React.useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      const canvas = hoverCanvasRef.current;
      const transform = transformRef.current;
      if (!container || !canvas || !transform) return;

      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = syncCanvasSize(canvas, rect);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const { x: hx, y: hy } = canvasToViewBox(localX, localY, transform);

      const nearby = getNearbyDotIndices(
        hx,
        hy,
        dots,
        grid,
        hoverRadius,
        hoverRadiusSq
      );

      if (nearby.length === 0) return;

      ctx.fillStyle = resolveColor(colorsRef.current.hover, container);
      const radiusPx = dotRadius * transform.scale;

      for (const i of nearby) {
        const dot = dots[i];
        const { px, py } = viewBoxToCanvas(dot.x, dot.y, transform);
        ctx.beginPath();
        ctx.arc(px, py, radiusPx, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [dots, grid, dotRadius, hoverRadius, hoverRadiusSq, syncCanvasSize]
  );

  const clearHoverLayer = React.useCallback(() => {
    const canvas = hoverCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
  }, []);

  const { xStep, yToRowIndex } = React.useMemo(() => {
    const sorted = [...dots].sort((a, b) => a.y - b.y || a.x - b.x);
    const rowMap = new Map<number, number>();
    let step = 1;
    let prevY = Number.NaN;
    let prevXInRow = Number.NaN;

    for (const p of sorted) {
      if (p.y !== prevY) {
        prevY = p.y;
        prevXInRow = Number.NaN;
        if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size);
      }
      if (!Number.isNaN(prevXInRow)) {
        const delta = p.x - prevXInRow;
        if (delta > 0) step = step === 1 ? delta : Math.min(step, delta);
      }
      prevXInRow = p.x;
    }

    return { xStep: step, yToRowIndex: rowMap };
  }, [dots]);

  const updateDrawerLayouts = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setDrawerLayouts([]);
      return;
    }

    const transform = getMapTransform(rect, width, height);
    transformRef.current = transform;

    const layouts: DrawerLayout[] = [];

    processedMarkers.forEach((marker, index) => {
      const source = markers[index];
      const statusLabel = source?.statusLabel;
      if (!statusLabel) return;

      const rowIndex = yToRowIndex.get(marker.y) ?? 0;
      const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
      const { px, py } = viewBoxToCanvas(marker.x + offsetX, marker.y, transform);
      const r = ((marker as MapMarker<M>).size ?? dotRadius) * transform.scale;
      const kind =
        source?.statusKind ??
        (statusLabel.toLowerCase().includes("verified") ? "verified" : "sites");

      layouts.push({
        id: index,
        left: px,
        top: py - r - 10,
        label: statusLabel,
        kind,
      });
    });

    setDrawerLayouts(layouts);
  }, [processedMarkers, markers, width, height, stagger, xStep, yToRowIndex, dotRadius]);

  React.useEffect(() => {
    colorsRef.current = { dot: dotColor, hover: hoverDotColor };
    drawBaseLayer();
  }, [dotColor, hoverDotColor, drawBaseLayer]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    drawBaseLayer();
    updateDrawerLayouts();

    const observer = new ResizeObserver(() => {
      drawBaseLayer();
      updateDrawerLayouts();
      clearHoverLayer();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [drawBaseLayer, clearHoverLayer, updateDrawerLayouts]);

  React.useLayoutEffect(() => {
    updateDrawerLayouts();
  }, [updateDrawerLayouts]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const scheduleHoverPaint = React.useCallback(
    (clientX: number, clientY: number) => {
      pendingPointerRef.current = { x: clientX, y: clientY };
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const pending = pendingPointerRef.current;
        if (!pending) return;
        drawHoverLayer(pending.x, pending.y);
      });
    },
    [drawHoverLayer]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      style={style}
      onMouseMove={(e) => {
        onMouseMove?.(e);
        scheduleHoverPaint(e.clientX, e.clientY);
      }}
      onMouseLeave={(e) => {
        pendingPointerRef.current = null;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        clearHoverLayer();
        onMouseLeave?.(e);
      }}
      {...divProps}
    >
      <canvas
        ref={baseCanvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <canvas
        ref={hoverCanvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {processedMarkers.map((marker, index) => {
          const rowIndex = yToRowIndex.get(marker.y) ?? 0;
          const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
          const x = marker.x + offsetX;
          const y = marker.y;
          const r = marker.size ?? dotRadius;
          const shouldPulse = pulse
            ? marker.pulse !== false
            : marker.pulse === true;
          const pulseTo = r * 2.8;
          const pulseOffset = `${((index * 0.41) % 1.4).toFixed(2)}s`;
          const pulseOffsetInner = `${((index * 0.41 + 0.7) % 1.4).toFixed(2)}s`;

          return (
            <g key={`${marker.x}-${marker.y}-${index}`}>
              <circle cx={x} cy={y} r={r} fill={markerColor} />
              {shouldPulse ? (
                <g>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={markerColor}
                    strokeOpacity={1}
                    strokeWidth={0.35}
                  >
                    <animate
                      attributeName="r"
                      values={`${r};${pulseTo}`}
                      dur="1.4s"
                      begin={pulseOffset}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0"
                      dur="1.4s"
                      begin={pulseOffset}
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={markerColor}
                    strokeOpacity={0.9}
                    strokeWidth={0.3}
                  >
                    <animate
                      attributeName="r"
                      values={`${r};${pulseTo}`}
                      dur="1.4s"
                      begin={pulseOffsetInner}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9;0"
                      dur="1.4s"
                      begin={pulseOffsetInner}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ) : null}
              {renderMarkerOverlay?.({
                marker: { ...marker, x, y },
                index,
                x,
                y,
                r,
              })}
            </g>
          );
        })}
      </svg>

      {drawerLayouts.map((drawer, index) => (
        <MapStatusDrawer
          key={drawer.id}
          label={drawer.label}
          kind={drawer.kind}
          left={drawer.left}
          top={drawer.top}
          delayMs={index * 120}
        />
      ))}
    </div>
  );
}
