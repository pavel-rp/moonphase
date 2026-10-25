import { isFlatPercent } from "@/lib/utils/numbers";

// NOTE: if you add a new color, you need to add it to the globals.css @source inline()
export type TwColorVariation = 300 | 700;
export type TwColor = "red" | "green" | "slate";

// Missing and flat changes are neutral, matching how formatPercent shows them.
const getPriceMovementColor = (priceChange: number | null): TwColor => {
  if (priceChange === null || !Number.isFinite(priceChange) || isFlatPercent(priceChange)) {
    return "slate";
  }
  if (priceChange > 0) {
    return "green";
  }
  return "red";
};

export const getPriceMovementColorVar = (
  priceChange: number | null,
  variation: TwColorVariation = 700
): string => `var(--color-${getPriceMovementColor(priceChange)}-${variation})`;

export const getPriceMovementTextColorClass = (
  priceChange: number | null,
  variation: TwColorVariation = 700
): string => `text-${getPriceMovementColor(priceChange)}-${variation}`;
