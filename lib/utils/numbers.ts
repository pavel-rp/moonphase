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

// Always signed ("+1.23%" / "-1.23%") per the data-display convention, except
// values that round to zero, which read "0.00%" rather than "+0.00%"/"-0.00%".
export const formatPercent = (num: number) => {
  num = num ?? 0;
  const fixed = Math.abs(num).toFixed(2);
  const sign = fixed === "0.00" ? "" : num > 0 ? "+" : num < 0 ? "-" : "";
  return `${sign}${fixed}%`;
};
