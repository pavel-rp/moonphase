import { CoinCapPort } from '@/ports/CoinCapPort';
import { Asset } from '@/domain/asset';
import { makeTag } from '@/lib/cache/tags';

export async function getAssets(
  deps: { coinCap: CoinCapPort },
  params: { limit?: number; offset?: number } = {},
): Promise<Asset[]> {
  const { limit = 19, offset = 0 } = params;
  const data = await deps.coinCap.listAssets({ limit, offset });
  // Potential place for caching tag; for now we ignore but could call revalidateTag.
  const _cacheTag = makeTag('assets', limit, offset);
  return data;
}