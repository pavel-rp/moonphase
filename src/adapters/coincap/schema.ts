import { z } from 'zod';

// CoinCap returns null for some metrics on thinly traded assets; read as 0.
const metric = z.string().nullable().transform((v) => (v === null ? 0 : Number(v)));
// A missing value kept as null: a 0 would display as a real flat move.
const nullableMetric = z.string().nullable().transform((v) => (v === null ? null : Number(v)));

const AssetSchema = z.object({
  id: z.string(),
  rank: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  symbol: z.string(),
  name: z.string(),
  supply: metric,
  maxSupply: nullableMetric,
  marketCapUsd: metric,
  volumeUsd24Hr: metric,
  priceUsd: z.string().transform(Number),
  changePercent24Hr: nullableMetric,
  vwap24Hr: metric,
  explorer: z.string().optional().nullable().transform((v) => v ?? ''),
});

type ParsedAsset = z.output<typeof AssetSchema>;

export interface DroppedAsset {
  id: string;
  error: z.ZodError;
}

// Parsed per item: a malformed asset is dropped instead of failing the whole
// list, which would blank the grid and 404 every detail page. Dropped assets
// are returned rather than logged here, since cached responses are re-parsed on
// every request; the adapter decides what is worth logging.
export const ListAssetsResponseSchema = z
  .object({ data: z.array(z.unknown()) })
  .transform(({ data }) => {
    const assets: ParsedAsset[] = [];
    const dropped: DroppedAsset[] = [];
    for (const item of data) {
      const result = AssetSchema.safeParse(item);
      if (result.success) {
        assets.push(result.data);
      } else {
        const id = (item as { id?: unknown } | null)?.id;
        dropped.push({ id: typeof id === 'string' ? id : '(no id)', error: result.error });
      }
    }
    return { data: assets, dropped };
  });
