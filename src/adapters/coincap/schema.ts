import { z } from 'zod';
import { logError } from '@/lib/observability';

// CoinCap returns null for some metrics on thinly traded assets; read as 0.
const metric = z.string().nullable().transform((v) => (v === null ? 0 : Number(v)));

const AssetSchema = z.object({
  id: z.string(),
  rank: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  symbol: z.string(),
  name: z.string(),
  supply: metric,
  maxSupply: z.string().nullable().transform((val) => (val === null ? null : Number(val))),
  marketCapUsd: metric,
  volumeUsd24Hr: metric,
  priceUsd: z.string().transform(Number),
  changePercent24Hr: metric,
  vwap24Hr: metric,
  explorer: z.string().optional().nullable().transform((v) => v ?? ''),
});

type ParsedAsset = z.output<typeof AssetSchema>;

export const ListAssetsResponseSchema = z.object({
  // Parsed per item: a malformed asset is dropped (and logged) instead of
  // failing the whole list, which would blank the grid and 404 every detail page.
  data: z
    .array(
      AssetSchema.nullable().catch(({ input, error }) => {
        logError(error, { adapter: 'CoinCapAdapter', droppedAsset: (input as { id?: unknown })?.id });
        return null;
      }),
    )
    .transform((assets) => assets.filter((a): a is ParsedAsset => a !== null)),
});