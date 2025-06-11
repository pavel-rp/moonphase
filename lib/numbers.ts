export const prettifyNumber = (num: number): string => {
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

export const formatNumber = (num: number) =>
  new Intl.NumberFormat("en-US").format(num);
