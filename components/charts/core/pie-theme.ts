import { PieTheme } from "./types";

export const defaultPieTheme: PieTheme = {
  size: 220,
  innerRadiusFraction: 0.62,
  padAngleRad: 0, // pads not used yet; reserved
  roundedRad: 0,
  liftPx: 10,
  baseRingOpacity: 0.35,
  innerRingOpacity: 0.04,
  strokeOpacity: 0.35,
  palette: ["#7ee787", "#3fb0ff", "#ffb86b", "#ff7eb6", "#b892ff", "#5be9d0"],
};

export function mergePieTheme(overrides?: Partial<PieTheme>): PieTheme {
  return { ...defaultPieTheme, ...(overrides ?? {}) };
}


