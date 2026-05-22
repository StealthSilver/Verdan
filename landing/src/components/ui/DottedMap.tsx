"use client";

import * as React from "react";
import DottedMapLib from "dotted-map";
import { useTheme } from "next-themes";
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

const VIEW_W = 800;
const VIEW_H = 400;
/** Legacy svg-dotted-map view width; marker sizes in CTA are tuned for this scale */
const LEGACY_VIEW_W = 200;

type MapMarker<M extends Marker> = M & { x: number; y: number };

type MapTransform = {
  renderW: number;
  renderH: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

export interface DottedMapProps<M extends Marker = Marker>
  extends React.HTMLAttributes<HTMLDivElement> {
  markers?: M[];
  dotColor?: string;
  markerColor?: string;
  dotRadius?: number;
  pulse?: boolean;
  renderMarkerOverlay?: (args: {
    marker: MapMarker<M>;
    index: number;
    x: number;
    y: number;
    r: number;
  }) => React.ReactNode;
}

function projectPoint(lat: number, lng: number) {
  const x = (lng + 180) * (VIEW_W / 360);
  const y = (90 - lat) * (VIEW_H / 180);
  return { x, y };
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
  markers = [],
  dotColor,
  markerColor = "#FF6900",
  dotRadius = 0.22,
  pulse = false,
  renderMarkerOverlay,
  className,
  style,
  ...divProps
}: DottedMapProps<M>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [drawerLayouts, setDrawerLayouts] = React.useState<DrawerLayout[]>([]);

  const markerScale = VIEW_W / LEGACY_VIEW_W;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const processedMarkers = React.useMemo(
    () =>
      markers.map((marker) => {
        const { x, y } = projectPoint(marker.lat, marker.lng);
        return { ...marker, x, y };
      }),
    [markers]
  );

  const svgMap = React.useMemo(() => {
    const map = new DottedMapLib({ height: 100, grid: "diagonal" });
    // Theme from next-themes is undefined on the server but may be set before
    // hydration on the client — use a stable default until mounted.
    const activeTheme = mounted ? (resolvedTheme ?? theme) : "light";
    const fallbackColor =
      activeTheme === "dark" ? "#FFFFFF40" : "#00000040";
    const color = dotColor ?? fallbackColor;

    return map.getSVG({
      radius: dotRadius,
      color,
      shape: "circle",
      backgroundColor: "transparent",
    });
  }, [dotColor, dotRadius, theme, resolvedTheme, mounted]);

  const updateDrawerLayouts = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setDrawerLayouts([]);
      return;
    }

    const transform = getMapTransform(rect, VIEW_W, VIEW_H);
    const layouts: DrawerLayout[] = [];

    processedMarkers.forEach((marker, index) => {
      const source = markers[index];
      const statusLabel = source?.statusLabel;
      if (!statusLabel) return;

      const { px, py } = viewBoxToCanvas(marker.x, marker.y, transform);
      const r = (marker.size ?? dotRadius) * markerScale * transform.scale;
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
  }, [processedMarkers, markers, dotRadius, markerScale]);

  React.useLayoutEffect(() => {
    updateDrawerLayouts();
  }, [updateDrawerLayouts]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updateDrawerLayouts);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateDrawerLayouts]);

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-[2/1] h-full w-full font-sans", className)}
      style={style}
      {...divProps}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL from dotted-map */}
      {mounted ? (
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          alt=""
          draggable={false}
          aria-hidden
          className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        />
      )}

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        {processedMarkers.map((marker, index) => {
          const { x, y } = marker;
          const r = (marker.size ?? dotRadius) * markerScale;
          const shouldPulse = pulse
            ? marker.pulse !== false
            : marker.pulse === true;
          const pulseTo = r * 2.8;
          const pulseOffset = `${((index * 0.41) % 1.4).toFixed(2)}s`;
          const pulseOffsetInner = `${((index * 0.41 + 0.7) % 1.4).toFixed(2)}s`;
          return (
            <g key={`${marker.lat}-${marker.lng}-${index}`}>
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
                marker,
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
