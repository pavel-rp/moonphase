"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PieProps } from "../core/types";
import { arcPath, computeSlicesWithColors } from "../core/pie-geometry";
import { mergePieTheme } from "../core/pie-theme";
import { countUp, tweenGlow, tweenLift } from "../core/gsap-presets";

/**
 * Holographic donut pie chart with hover lift and glow.
 * Uses SVG for precise geometry and a CSS conic-gradient sheen layer.
 */
type ExtraProps = {
  totalLabel?: string;
  unstyled?: boolean;
  showLegend?: boolean;
};

export function Holo({
  data,
  size: sizeOverride,
  innerRadius,
  animate = true,
  gsapEase = "power2.out",
  onSliceHover,
  onSliceClick,
  theme: themeOverrides,
  totalLabel = "Total",
  unstyled = false,
  showLegend = true,
}: PieProps & ExtraProps) {
  const theme = mergePieTheme(themeOverrides);
  const size = sizeOverride ?? theme.size;
  const radius = size / 2;
  const resolvedInner = innerRadius ?? Math.round(radius * theme.innerRadiusFraction);

  const total = useMemo(
    () => data.reduce((a, b) => a + Math.max(0, b.value), 0),
    [data]
  );

  const slices = useMemo(() => computeSlicesWithColors(data, theme.palette), [data, theme.palette]);

  const svgRef = useRef<SVGSVGElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Count-up center value
  useEffect(() => {
    if (!centerRef.current || !animate) return;
    countUp(centerRef.current, total, gsapEase);
  }, [total, animate, gsapEase]);

  // Hover micro-motion
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    slices.forEach((s, i) => {
      const g = svg.querySelector<SVGGElement>(`g[data-idx="${i}"]`);
      if (!g) return;
      const isActive = active === i;
      const offX = Math.cos(s.midRad) * theme.liftPx;
      const offY = Math.sin(s.midRad) * theme.liftPx;
      tweenLift(g, offX, offY, isActive);
      const glow = g.querySelector<SVGPathElement>("path.slice");
      if (glow) tweenGlow(glow, isActive);
    });
  }, [active, slices, theme.liftPx]);

  const onMove = (e: React.MouseEvent, i: number) => {
    const s = slices[i];
    const pct = (s.fraction * 100).toFixed(1);
    setTooltip({ x: e.clientX + 12, y: e.clientY + 12, text: `${s.datum.label}: ${s.datum.value.toLocaleString()} (${pct}%)` });
    onSliceHover?.(s.datum, i);
  };

  const ChartBody = (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="relative w-full h-full max-w-full max-h-full">
        <svg 
          ref={svgRef} 
          viewBox={`0 0 ${size} ${size}`} 
          width="100%" 
          height="100%" 
          preserveAspectRatio="xMidYMid meet"
          className="relative"
        >
          {/* slices */}
          {slices.map((s, i) => {
            const d = arcPath(radius, radius, radius, resolvedInner, s.startRad, s.endRad);
            return (
              <g
                key={s.datum.id ?? `${i}-${s.datum.label}`}
                data-idx={i}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => {
                  setActive(null);
                  setTooltip(null);
                }}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onMouseMove={(e) => onMove(e, i)}
                onClick={() => onSliceClick?.(s.datum, i)}
              >
                <path className="slice" d={d} fill={s.color} opacity={0.85} />
              </g>
            );
          })}
        </svg>

        {/* inner hole overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="bg-black/50"
            style={{
              width: resolvedInner * 2 - 8,
              height: resolvedInner * 2 - 8,
              borderRadius: '50%',
            }}
          />
        </div>

        {/* center label */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div ref={centerRef} className="text-2xl font-semibold tracking-tight text-white" />
            <div className="text-xs text-white/60">{totalLabel}</div>
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-white/10 px-2 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-md"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );

  if (unstyled) {
    return ChartBody;
  }

  return (
    <div className="relative w-full h-full">
      <div className="relative h-full rounded-3xl bg-white/5 p-3 md:p-4 ring-1 ring-white/10 backdrop-blur-md flex flex-col">
        {showLegend && (
          <div className="mb-3 flex items-end justify-between gap-2">
            <div className="text-sm text-white/70">Allocation</div>
            <div className="flex gap-2">
              {data.map((d, i) => (
                <div key={d.id ?? `${i}-${d.label}`} className="flex items-center gap-2 text-xs text-white/70">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: slices[i].color }} />
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0">
          {ChartBody}
        </div>
      </div>
    </div>
  );
}