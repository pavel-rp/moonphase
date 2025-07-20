// NOTE: if you add a new color, you need to add it to the globals.css @source inline()
export type TwColorVariation = 300 | 700;
export type TwColor = "red" | "green" | "white";

const getPriceMovementColor = (priceChange: number): TwColor => {
  if (priceChange === 0) {
    return "white";
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
