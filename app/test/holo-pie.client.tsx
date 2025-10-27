import React, { useMemo, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";

/**
 * HoloPie — holographic donut pie with interaction
 * Tailwind + SVG + CSS conic-gradient sheen + GSAP micro-motion
 */

type Slice = { label: string; value: number; color?: string };

type Props = {
  data: Slice[];
  totalLabel?: string;
  radius?: number;       // outer radius (px)
  innerRadius?: number;  // inner radius (px)
  lift?: number;         // px lift on hover/focus
};

const TAU = Math.PI * 2;
const polar = (cx: number, cy: number, r: number, a: number) => [
  cx + r * Math.cos(a),
  cy + r * Math.sin(a),
];

function arcPath(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  // donut arc between [a0, a1] radians
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r2, a1);
  const [x3, y3] = polar(cx, cy, r2, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${x0} ${y0}`,
    `A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${r2} ${r2} 0 ${large} 0 ${x3} ${y3}`,
    "Z",
  ].join(" ");
}

export default function HoloPie({
  data,
  totalLabel = "Total",
  radius = 110,
  innerRadius = 68,
  lift = 10,
}: Props) {
  const total = useMemo(() => data.reduce((a, b) => a + Math.max(0, b.value), 0), [data]);
  const [active, setActive] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  // Count-up center value on mount / data change
  useEffect(() => {
    if (!centerRef.current) return;
    gsap.killTweensOf(centerRef.current);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: total,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        if (centerRef.current) centerRef.current.textContent = Math.round(obj.v).toLocaleString();
      },
    });
  }, [total]);

  // Precompute slices geometry
  const slices = useMemo(() => {
    let acc = -Math.PI / 2; // start at top
    return data.map((s, i) => {
      const frac = total > 0 ? s.value / total : 0;
      const a0 = acc;
      const a1 = acc + frac * TAU;
      acc = a1;
      const mid = (a0 + a1) / 2;
      const path = arcPath(radius, radius, radius, innerRadius, a0, a1);
      const off = {
        x: Math.cos(mid) * lift,
        y: Math.sin(mid) * lift,
      };
      const color =
        s.color ??
        ["#7ee787", "#3fb0ff", "#ffb86b", "#ff7eb6", "#b892ff", "#5be9d0"][i % 6];
      return { ...s, a0, a1, mid, path, off, color, frac };
    });
  }, [data, total, radius, innerRadius, lift]);

  // Hover/focus lift micro-motion
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    slices.forEach((_, i) => {
      const g = svg.querySelector<SVGGElement>(`g[data-idx="${i}"]`);
      if (!g) return;
      const isActive = active === i;
      gsap.to(g, {
        duration: 0.35,
        x: isActive ? slices[i].off.x : 0,
        y: isActive ? slices[i].off.y : 0,
        ease: "power3.out",
      });
      const glow = g.querySelector<SVGPathElement>("path.slice");
      if (glow) {
        gsap.to(glow, {
          duration: 0.35,
          filter: isActive ? "drop-shadow(0px 6px 12px rgba(139,213,255,.35))" : "none",
        });
      }
    });
  }, [active, slices]);

  // Tooltip handlers
  const onMove = (e: React.MouseEvent, i: number) => {
    const s = slices[i];
    const pct = (s.frac * 100).toFixed(1);
    setTooltip({
      x: e.clientX + 12,
      y: e.clientY + 12,
      text: `${s.label}: ${s.value.toLocaleString()} (${pct}%)`,
    });
  };

  const size = radius * 2;
  const ringInset = Math.round((radius - innerRadius) * 0.25);

  return (
    <div className="relative inline-block">
      <div className="relative rounded-3xl bg-white/5 p-4 md:p-6 ring-1 ring-white/10 backdrop-blur-md">
        <div className="mb-3 flex items-end justify-between gap-2">
          <div className="text-sm text-white/70">Allocation</div>
          <div className="flex gap-2">
            {data.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: slices[i].color }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Chart panel */}
          <div className="relative grid place-items-center">
            {/* SVG pie */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${size} ${size}`}
              width={size}
              height={size}
              className="relative"
              role="img"
              aria-label="Allocation pie chart"
            >
              {/* base ring */}
              <circle cx={radius} cy={radius} r={radius - ringInset} fill="rgba(0,0,0,.35)" />
              <circle
                cx={radius}
                cy={radius}
                r={innerRadius + ringInset}
                fill="rgba(255,255,255,.04)"
              />

              {/* slices */}
              {slices.map((s, i) => (
                <g
                  key={i}
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
                  aria-label={`${s.label} ${Math.round(s.frac * 100)} percent`}
                >
                  <path
                    className="slice"
                    d={s.path}
                    fill={s.color}
                    opacity={0.85}
                    stroke="rgba(255,255,255,.35)"
                    strokeWidth={0.5}
                  />
                </g>
              ))}
            </svg>

            {/* Holographic sheen layer (CSS-only, blends on top) */}
            <div
              className="pointer-events-none absolute"
              style={{
                width: size,
                height: size,
                borderRadius: "9999px",
                mixBlendMode: "screen",
                background:
                  "conic-gradient(from 220deg, rgba(126,232,135,.0), rgba(126,232,135,.45), rgba(63,176,255,.0) 40%, rgba(184,146,255,.5) 60%, rgba(91,233,208,.0))",
              }}
            />
            {/* Inner ring to keep the donut clean */}
            <div
              className="pointer-events-none absolute bg-black/50 ring-1 ring-white/15"
              style={{
                width: (innerRadius * 2) - 8,
                height: (innerRadius * 2) - 8,
                borderRadius: "9999px",
              }}
            />
            {/* Center label */}
            <div className="pointer-events-none absolute grid place-items-center">
              <div className="text-center">
                <div ref={centerRef} className="text-2xl font-semibold tracking-tight" />
                <div className="text-xs text-white/60">{totalLabel}</div>
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none fixed z-50 rounded-lg bg-white/10 px-2 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-md"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
