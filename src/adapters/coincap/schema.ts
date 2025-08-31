import { z } from 'zod';

const AssetSchema = z.object({
  id: z.string(),
  rank: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  symbol: z.string(),
  name: z.string(),
  supply: z.string().transform(Number),
  maxSupply: z.string().nullable().transform((val) => (val === null ? null : Number(val))),
  marketCapUsd: z.string().transform(Number),
  volumeUsd24Hr: z.string().transform(Number),
  priceUsd: z.string().transform(Number),
  changePercent24Hr: z.string().transform(Number),
  vwap24Hr: z.string().transform(Number),
  explorer: z.string().optional().nullable().transform((v) => v ?? ''),
});

export const ListAssetsResponseSchema = z.object({
  data: z.array(AssetSchema),
});