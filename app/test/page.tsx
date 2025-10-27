"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { Holo } from "@/components/charts/pie";

/**
 * MoonPhase Futuristic Chart Gallery
 *
 * Tailwind + modern CSS + SVG + GSAP.
 * Drop this component anywhere (e.g., in a Next.js page) and it will render a bento-style gallery
 * of futuristic chart patterns you can riff on: CSS conic pie, glassy SVG donut, HUD gauge,
 * neon line, minimalist candles, and a holographic ring illusion (CSS-only).
 *
 * Notes
 * - No data libs required; everything here is hand-rolled for clarity and hackability.
 * - Performance-friendly: heavy blur is kept to static panels, not animated strokes.
 * - All colors are CSS vars so you can theme easily.
 */

// --- Helpers ---------------------------------------------------------------
const toRadians = (deg: number) => (deg * Math.PI) / 180;

function describeArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
) {
  // Large-arc and sweep flags for SVG arc path
  const startRad = toRadians(start);
  const endRad = toRadians(end);
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = end - start <= 180 ? 0 : 1;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// Example data
const pieData = [28, 22, 18, 14, 10, 8]; // tot = 100
const colors = [
  "#7ee787",
  "#3fb0ff",
  "#ffb86b",
  "#ff7eb6",
  "#b892ff",
  "#5be9d0",
];

const lineData = [
  40, 44, 39, 52, 61, 57, 63, 59, 75, 72, 80, 78, 90, 87, 95, 92,
];

const candleData = [
  // {open, high, low, close}
  { o: 45, h: 50, l: 43, c: 48 },
  { o: 48, h: 55, l: 47, c: 53 },
  { o: 53, h: 56, l: 52, c: 54 },
  { o: 54, h: 58, l: 51, c: 52 },
  { o: 52, h: 57, l: 50, c: 56 },
  { o: 56, h: 64, l: 55, c: 62 },
  { o: 62, h: 65, l: 60, c: 61 },
  { o: 61, h: 66, l: 59, c: 64 },
  { o: 64, h: 70, l: 63, c: 69 },
  { o: 69, h: 73, l: 66, c: 68 },
];

// --- Tile wrapper with subtle parallax ------------------------------------
function Tile({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set(el, { transformPerspective: 800 });
      const onEnter = () => {
        gsap.to(el, {
          duration: 0.5,
          scale: 1.02,
          boxShadow: "0 10px 40px rgba(0,0,0,.35)",
        });
      };
      const onLeave = () => {
        gsap.to(el, {
          duration: 0.5,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          boxShadow: "0 4px 24px rgba(0,0,0,.25)",
        });
      };
      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -6; // tilt
        const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
        gsap.to(el, {
          duration: 0.4,
          rotateX: rx,
          rotateY: ry,
          overwrite: true,
        });
      };
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mousemove", onMove);
      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("mousemove", onMove);
      };
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative flex flex-col gap-3 rounded-3xl p-4 md:p-6 bg-white/5 dark:bg-white/5 backdrop-blur-md ring-1 ring-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
    >
      <div className="text-sm tracking-wide text-white/70">{title}</div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02]">
        {/* single blur layer for depth */}
        <div
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)] blur-xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(53, 199, 255, .20), rgba(123, 97, 255, .16) 40%, transparent)",
          }}
        />
        <div className="relative h-full w-full">{children}</div>
      </div>
    </div>
  );
}

// --- 1) CSS Conic Gradient Pie --------------------------------------------
function ConicPie() {
  const ref = useRef<HTMLDivElement>(null);
  const angles = useMemo(() => {
    const total = pieData.reduce((a, b) => a + b, 0);
    let acc = 0;
    return pieData.map((v) => {
      const start = (acc / total) * 360;
      acc += v;
      const end = (acc / total) * 360;
      return [start, end] as const;
    });
  }, []);

  useEffect(() => {
    // Animate sweep via CSS custom props
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline();
    angles.forEach(([, end], i) => {
      tl.to(
        el,
        { [`--a${i}`]: `${end}deg`, duration: 0.4, ease: "power2.out" },
        i * 0.06
      );
    });
    return () => {
      tl.kill();
    };
  }, [angles]);

  const stops =
    angles
      .map(([s], i) => `${colors[i % colors.length]} ${s}deg var(--a${i}, ${s}deg)`) // start->anim var
      .join(", ") + ", transparent var(--a5, 360deg) 360deg";

  return (
    <div ref={ref} className="grid h-full w-full place-items-center">
      <div
        className="relative h-40 w-40 rounded-full"
        style={{ backgroundImage: `conic-gradient(${stops})` }}
      >
        {/* inner hole */}
        <div className="absolute inset-4 rounded-full bg-black/40 ring-1 ring-white/10" />
        {/* sheen */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full mix-blend-screen"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,.25), rgba(255,255,255,0) 60%)",
          }}
        />
      </div>
    </div>
  );
}

// --- 2) Glassy SVG Donut (with bevel + inner glow) ------------------------
function GlassDonut() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGPathElement>(".wedge");
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, duration: 0.6 }, i * 0.08);
    });
    return () => {
      tl.kill();
    };
  }, []);

  // Build wedges
  const cx = 150,
    cy = 100,
    rOuter = 70,
    rInner = 46;
  const total = pieData.reduce((a, b) => a + b, 0);
  let acc = -90; // start at top
  const wedges = pieData.map((v, i) => {
    const sweep = (v / total) * 360;
    const start = acc;
    const end = acc + sweep;
    acc = end;
    const arcOuter = describeArc(cx, cy, rOuter, start, end);
    const arcInner = describeArc(cx, cy, rInner, end, start); // reverse
    const d = `${arcOuter} L ${cx + rInner * Math.cos(toRadians(end))} ${
      cy + rInner * Math.sin(toRadians(end))
    } ${arcInner} Z`;
    return (
      <g key={i}>
        {/* bevel highlight */}
        <path d={d} fill={colors[i % colors.length]} opacity={0.22} />
        <path
          d={d}
          className="wedge"
          fill="none"
          stroke={colors[i % colors.length]}
          strokeOpacity={0.9}
          strokeWidth={3}
        />
      </g>
    );
  });

  return (
    <svg ref={svgRef} viewBox="0 0 300 200" className="h-full w-full">
      <defs>
        <radialGradient id="innerGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
        </radialGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="12"
            floodColor="rgba(0,0,0,.35)"
          />
        </filter>
      </defs>
      <g filter="url(#softShadow)">{wedges}</g>
      {/* inner disk glow */}
      <circle cx={cx} cy={cy} r={rInner - 6} fill="url(#innerGlow)" />
    </svg>
  );
}

// --- 3) Tesla-adjacent HUD Gauge -----------------------------------------
function HudGauge() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const needle = svg.querySelector(".needle");
    gsap.fromTo(
      needle,
      { rotate: -110 },
      {
        rotate: 45,
        transformOrigin: "150px 120px",
        duration: 1.2,
        ease: "power3.out",
      }
    );
  }, []);

  const ticks = Array.from({ length: 25 }, (_, i) => i);
  return (
    <svg ref={ref} viewBox="0 0 300 200" className="h-full w-full">
      <defs>
        <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#3fb0ff" />
          <stop offset="100%" stopColor="#7ee787" />
        </linearGradient>
      </defs>
      {/* arc backdrop */}
      <path
        d={describeArc(150, 120, 80, -140, 140)}
        stroke="rgba(255,255,255,.15)"
        strokeWidth={10}
        fill="none"
      />
      {/* tick marks */}
      {ticks.map((i) => {
        const a = -140 + (i / (ticks.length - 1)) * 280;
        const r1 = 80,
          r2 = i % 5 === 0 ? 64 : 70;
        const x1 = 150 + r1 * Math.cos(toRadians(a));
        const y1 = 120 + r1 * Math.sin(toRadians(a));
        const x2 = 150 + r2 * Math.cos(toRadians(a));
        const y2 = 120 + r2 * Math.sin(toRadians(a));
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,.35)"
            strokeWidth={i % 5 === 0 ? 2 : 1}
          />
        );
      })}
      {/* value arc */}
      <path
        d={describeArc(150, 120, 80, -140, 40)}
        stroke="url(#grad)"
        strokeWidth={12}
        strokeLinecap="round"
        fill="none"
      />
      {/* needle */}
      <g className="needle">
        <circle cx={150} cy={120} r={6} fill="#fff" />
        <rect x={148} y={60} width={4} height={60} rx={2} fill="#fff" />
      </g>
      {/* label */}
      <text
        x={150}
        y={160}
        textAnchor="middle"
        className="fill-white/80"
        style={{ fontSize: 14 }}
      >
        Dominance 62%
      </text>
    </svg>
  );
}

// --- 4) Neon Line Chart (SVG path draw) ------------------------------------
function NeonLine() {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(p, { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" });
  }, []);

  const W = 300,
    H = 200,
    PAD = 18;
  const xs = lineData.map(
    (_, i) => PAD + (i / (lineData.length - 1)) * (W - PAD * 2)
  );
  const min = Math.min(...lineData),
    max = Math.max(...lineData);
  const ys = lineData.map(
    (v) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2)
  );
  const d = xs.map((x, i) => `${i ? "L" : "M"} ${x} ${ys[i]}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3fb0ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3fb0ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* area shade */}
      <path
        d={`${d} L ${xs.at(-1)} ${H - PAD} L ${xs[0]} ${H - PAD} Z`}
        fill="url(#lineGrad)"
      />
      {/* line */}
      <path ref={ref} d={d} fill="none" stroke="#8bd5ff" strokeWidth={2.5} />
      {/* latest dot */}
      <circle cx={xs.at(-1)} cy={ys.at(-1)!} r={4} fill="#7ee787" />
    </svg>
  );
}

// --- 5) Minimal Candles ----------------------------------------------------
function MiniCandles() {
  const W = 300,
    H = 200,
    PAD = 16;
  const min = Math.min(...candleData.map((c) => c.l));
  const max = Math.max(...candleData.map((c) => c.h));
  const scaleY = (v: number) =>
    H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);

  const colUp = "#7ee787";
  const colDn = "#ff7eb6";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      {/* grid */}
      {[0.25, 0.5, 0.75].map((g, i) => (
        <line
          key={i}
          x1={PAD}
          x2={W - PAD}
          y1={PAD + g * (H - PAD * 2)}
          y2={PAD + g * (H - PAD * 2)}
          stroke="rgba(255,255,255,.12)"
        />
      ))}
      {candleData.map((c, i) => {
        const x = PAD + i * ((W - PAD * 2) / (candleData.length - 1));
        const up = c.c >= c.o;
        const w = 10;
        const yOpen = scaleY(c.o);
        const yClose = scaleY(c.c);
        const yHigh = scaleY(c.h);
        const yLow = scaleY(c.l);
        return (
          <g key={i}>
            <line
              x1={x}
              x2={x}
              y1={yHigh}
              y2={yLow}
              stroke={up ? colUp : colDn}
              strokeWidth={1.25}
            />
            <rect
              x={x - w / 2}
              width={w}
              y={Math.min(yOpen, yClose)}
              height={Math.max(2, Math.abs(yClose - yOpen))}
              rx={2}
              fill={up ? colUp : colDn}
              opacity={0.85}
            />
          </g>
        );
      })}
    </svg>
  );
}

// --- 6) Holographic Ring Illusion (CSS-only) -------------------------------
// function HoloRing() {
//   return (
//     <div className="grid h-full w-full place-items-center">
//       <div className="relative h-40 w-40 rounded-full">
//         {/* iridescent sweep */}
//         <div
//           className="absolute inset-0 rounded-full"
//           style={{
//             background:
//               "conic-gradient(from 200deg, rgba(126,232,135,.0), rgba(126,232,135,.5), rgba(63,176,255,.0) 40%, rgba(184,146,255,.5) 60%, rgba(91,233,208,.0))",
//             filter: "saturate(1.2)",
//           }}
//         />
//         {/* ring */}
//         <div className="absolute inset-[14%] rounded-full bg-black/50 ring-1 ring-white/15" />
//         {/* subtle glow */}
//         <div
//           className="pointer-events-none absolute -inset-2 rounded-full blur-2xl"
//           style={{
//             background:
//               "radial-gradient(60% 60% at 50% 50%, rgba(139,213,255,.25), transparent 60%)",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// --- Main Gallery ----------------------------------------------------------
export default function FuturisticChartsGallery() {
  return (
    <div className="min-h-screen w-full bg-[#0a0f16] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <header className="mb-8 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              MoonPhase • Futuristic Charts
            </h1>
            <p className="text-white/60">
              Tailwind • CSS • SVG • GSAP — glassy, HUD, neon. All web-friendly.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              Blur kept to panels
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              SVG for precision
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              GSAP micro-motion
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Tile title="CSS Conic Pie (fast, buttery)">
            <ConicPie />
          </Tile>
          <Tile title="Glassy Donut (SVG bevel + glow)">
            <GlassDonut />
          </Tile>
          <Tile title="HUD Gauge (Tesla-adjacent)">
            <HudGauge />
          </Tile>
          <Tile title="Neon Line (draw-on path)">
            <NeonLine />
          </Tile>
          <Tile title="Minimal Candles (SVG)">
            <MiniCandles />
          </Tile>
          <Tile title="Holographic Donut (library proto)">
            <Holo
              data={[
                { label: "BTC", value: 42, color: "#7ee787" },
                { label: "ETH", value: 25, color: "#3fb0ff" },
                { label: "SOL", value: 14, color: "#ffb86b" },
                { label: "ARB", value: 9, color: "#ff7eb6" },
                { label: "OP", value: 6, color: "#b892ff" },
                { label: "ALTS", value: 4, color: "#5be9d0" },
              ]}
              totalLabel="Holdings"
              size={200}
            />
          </Tile>
        </div>
      </div>
    </div>
  );
}
