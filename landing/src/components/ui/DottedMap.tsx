"use client";

import * as React from "react";
import { createMap } from "svg-dotted-map";

import { cn } from "@/lib/utils";

export interface Marker {
  lat: number;
  lng: number;
  size?: number;
  pulse?: boolean;
}

/** addMarkers returns markers with lat/lng removed; only x, y and other props (e.g. size) remain */
type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & {
  x: number;
  y: number;
};

export interface DottedMapProps<M extends Marker = Marker>
  extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  mapSamples?: number;
  markers?: M[];
  dotColor?: string;
  hoverDotColor?: string;
  markerColor?: string;
  dotRadius?: number;
  stagger?: boolean;
  pulse?: boolean;
  hoverStagger?: boolean;

  renderMarkerOverlay?: (args: {
    marker: MapMarker<M>;
    index: number;
    x: number;
    y: number;
    r: number;
  }) => React.ReactNode;
}

export function DottedMap<M extends Marker = Marker>({
  width = 150,
  height = 75,
  mapSamples = 5000,
  markers = [],
  dotColor = "currentColor",
  hoverDotColor = "rgb(74, 137, 92)",
  markerColor = "#FF6900",
  dotRadius = 0.2,
  stagger = true,
  pulse = false,
  hoverStagger = true,
  renderMarkerOverlay,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  ...svgProps
}: DottedMapProps<M>) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { points, addMarkers } = createMap({
    width,
    height,
    mapSamples,
  });
  const processedMarkers = addMarkers(markers);

  const { xStep, yToRowIndex } = React.useMemo(() => {
    const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x);
    const rowMap = new Map<number, number>();
    let step = 0;
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
        if (delta > 0) step = step === 0 ? delta : Math.min(step, delta);
      }
      prevXInRow = p.x;
    }

    return { xStep: step || 1, yToRowIndex: rowMap };
  }, [points]);

  const activeDotColor = isHovered ? hoverDotColor : dotColor;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-gray-500 dark:text-gray-500", className)}
      style={{ width: "100%", height: "100%", ...style }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      {...svgProps}
    >
      {points.map((point, index) => {
        const rowIndex = yToRowIndex.get(point.y) ?? 0;
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
        const staggerDelay = hoverStagger ? `${(index % 48) * 14}ms` : "0ms";

        return (
          <circle
            cx={point.x + offsetX}
            cy={point.y}
            r={dotRadius}
            fill={activeDotColor}
            key={`${point.x}-${point.y}-${index}`}
            style={{
              transition: "fill 0.55s ease-out",
              transitionDelay: isHovered ? staggerDelay : "0ms",
            }}
          />
        );
      })}

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

        return (
          <g key={`${marker.x}-${marker.y}-${index}`}>
            <circle cx={x} cy={y} r={r} fill={markerColor} />

            {shouldPulse ? (
              <g pointerEvents="none">
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
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0"
                    dur="1.4s"
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
                    begin="0.7s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0"
                    dur="1.4s"
                    begin="0.7s"
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
  );
}
