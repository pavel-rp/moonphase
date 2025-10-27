import { TAU, Datum, PieSliceGeometry, ComputedSlice } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/**
 * Compute normalized fractions and angles for a pie dataset starting at -90deg.
 */
export function computePieGeometry(data: Datum[]): PieSliceGeometry[] {
  const total = data.reduce((acc, d) => acc + Math.max(0, d.value), 0);
  let cursor = -Math.PI / 2; // start at top
  return data.map((d, index) => {
    const fraction = total > 0 ? Math.max(0, d.value) / total : 0;
    const startRad = cursor;
    const endRad = cursor + fraction * TAU;
    cursor = endRad;
    const midRad = (startRad + endRad) / 2;
    return { index, startRad, endRad, midRad, fraction };
  });
}

/**
 * SVG donut arc path between two angles a0..a1.
 */
export function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number
): string {
  const [x0, y0] = polar(cx, cy, rOuter, a0);
  const [x1, y1] = polar(cx, cy, rOuter, a1);
  const [x2, y2] = polar(cx, cy, rInner, a1);
  const [x3, y3] = polar(cx, cy, rInner, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${x0} ${y0}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x3} ${y3}`,
    "Z",
  ].join(" ");
}

export function applyPalette(data: Datum[], palette: string[]): string[] {
  return data.map((_, i) => palette[i % palette.length]);
}

export function computeSlicesWithColors(
  data: Datum[],
  palette: string[]
): ComputedSlice[] {
  const geometry = computePieGeometry(data);
  const colors = applyPalette(data, palette);
  return geometry.map((g, i) => ({ ...g, datum: data[i], color: data[i].color ?? colors[i] }));
}


