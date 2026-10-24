export const prettifyNumber = (num: number | null | undefined): string => {
  num = num ?? 0;
  const options: Intl.NumberFormatOptions =
    num <= 10000
      ? { useGrouping: true }
      : {
          notation: "compact",
          compactDisplay: "short",
          useGrouping: false,
        };

  const formatter = new Intl.NumberFormat("en-US", options);
  return formatter.format(num);
};

export const formatNumber = (num: number) => {
  num = num ?? 0;

  // For very small numbers (like Shiba Inu), show more decimal places
  if (num > 0 && num < 0.01) {
    // Show up to 8 decimal places to preserve precision for ultra-cheap coins
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 8,
    }).format(num);
  }

  // For normal numbers, show 2 decimal places
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * True when a percent change displays as "0.00%". Shared by the formatter and
 * the gain/loss color so a tiny move never shows an unsigned value in red/green.
 */
export const isFlatPercent = (num: number) => Math.abs(num).toFixed(2) === "0.00";

// Always signed ("+1.23%" / "-1.23%") per the data-display convention, except
// values that round to zero, which read "0.00%" rather than "+0.00%"/"-0.00%".
// A missing value reads "n/a" rather than posing as a real flat move.
export const formatPercent = (num: number | null | undefined) => {
  if (num == null || !Number.isFinite(num)) return "n/a";
  if (isFlatPercent(num)) return "0.00%";
  return `${num > 0 ? "+" : "-"}${Math.abs(num).toFixed(2)}%`;
};
