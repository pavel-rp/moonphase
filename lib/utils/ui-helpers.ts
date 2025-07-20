export type TwColorVariation =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

const getPriceMovementColor = (priceChange: number): string => {
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
