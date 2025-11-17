// NOTE: if you add a new color, you need to add it to the globals.css @source inline()
export type TwColorVariation = 300 | 700;
export type TwColor = "red" | "green" | "slate";

// Tailwind default color values for use in CSS filters, inline styles, etc.
// CSS variable references don't work in filter functions
const COLOR_VALUES: Record<TwColor, Record<TwColorVariation, string>> = {
  red: {
    300: "#fca5a5",
    700: "#b91c1c",
  },
  green: {
    300: "#86efac",
    700: "#15803d",
  },
  slate: {
    300: "#cbd5e1",
    700: "#334155",
  },
};

const getPriceMovementColor = (priceChange: number): TwColor => {
  if (priceChange === 0) {
    return "slate";
  }
  if (priceChange > 0) {
    return "green";
  }
  return "red";
};

export const getPriceMovementColorVar = (
  priceChange: number,
  variation: TwColorVariation = 700
): string => `var(--color-${getPriceMovementColor(priceChange)}-${variation})`;

export const getPriceMovementTextColorClass = (
  priceChange: number,
  variation: TwColorVariation = 700
): string => `text-${getPriceMovementColor(priceChange)}-${variation}`;

/**
 * Returns the actual hex color value for price movement indication.
 * Use this instead of getPriceMovementColorVar when you need an actual color value
 * (e.g., in CSS filters, canvas, or anywhere CSS variables don't work).
 */
export const getPriceMovementColorValue = (
  priceChange: number,
  variation: TwColorVariation = 700
): string => COLOR_VALUES[getPriceMovementColor(priceChange)][variation];
