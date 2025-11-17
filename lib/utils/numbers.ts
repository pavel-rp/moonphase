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

export const formatPercent = (num: number) => {
  num = num ?? 0;
  return `${num.toFixed(2)}%`;
};
