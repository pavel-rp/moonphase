import { z } from 'zod';

export const Ticker24hrSchema = z.object({
  weightedAvgPrice: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  lastPrice: z.union([z.string(), z.number()]).transform((v) => Number(v)).optional(),
  priceChangePercent: z.union([z.string(), z.number()]).transform((v) => Number(v)).optional(),
});

// Raw Kline tuple schema as returned by Binance
// [
//   0 openTime,
//   1 open,
//   2 high,
//   3 low,
//   4 close,
//   5 volume,
//   6 closeTime,
//   7 quoteAssetVolume,
//   8 numberOfTrades,
//   9 takerBuyBaseVolume,
//   10 takerBuyQuoteVolume,
//   11 ignore
// ]
const RawKlineTuple = z
  .array(z.union([z.string(), z.number()]))
  .min(7)
  .transform((arr) => [
    Number(arr[0]), // openTime
    arr[1], // open
    arr[2], // high
    arr[3], // low
    arr[4], // close
    arr[5], // volume
    Number(arr[6]), // closeTime
    arr[7],
    arr[8],
    arr[9],
    arr[10],
    arr[11],
  ] as [number, unknown, unknown, unknown, unknown, unknown, number, ...unknown[]]);

export const KlinesSchema = z
  .array(RawKlineTuple)
  .transform((tuples) =>
    tuples.map((t) => ({
      openTime: t[0],
      open: Number(t[1]),
      high: Number(t[2]),
      low: Number(t[3]),
      close: Number(t[4]),
      volume: Number(t[5]),
      closeTime: t[6],
    })),
  );

export type Ticker24hrResponse = z.infer<typeof Ticker24hrSchema>;
export type ParsedKlines = z.infer<typeof KlinesSchema>;

