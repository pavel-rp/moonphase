export const prettifyNumber = (num: number): string => {
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
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercent = (num: number) => {
  num = num ?? 0;
  return `${num.toFixed(2)}%`;
};
