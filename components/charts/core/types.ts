/**
 * Shared chart types
 */

export type Datum = {
  id?: string;
  label: string;
  value: number;
  color?: string;
};

export interface PieTheme {
  // Sizing
  size: number; // pixels (width == height)
  innerRadiusFraction: number; // 0..1 of size/2
  padAngleRad: number; // radians between slices
  roundedRad: number; // radians for rounded edges (not used in Holo yet)
  liftPx: number; // hover lift in px
  // Visuals
  baseRingOpacity: number;
  innerRingOpacity: number;
  strokeOpacity: number;
  palette: string[]; // default slice colors
}

export interface PieProps {
  data: Datum[];
  size?: number;
  innerRadius?: number; // pixels; overrides theme fraction
  padAngle?: number; // radians
  rounded?: number; // radians
  animate?: boolean;
  gsapEase?: string; // e.g., 'power2.out'
  onSliceHover?(d: Datum, idx: number): void;
  onSliceClick?(d: Datum, idx: number): void;
  /**
   * Theme overrides. Provide only the fields you want to override.
   */
  theme?: Partial<PieTheme>;
}

export type PieSliceGeometry = {
  index: number;
  startRad: number;
  endRad: number;
  midRad: number;
  fraction: number; // 0..1
};

export type ComputedSlice = PieSliceGeometry & {
  datum: Datum;
  color: string;
};

export const TAU = Math.PI * 2;

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}


