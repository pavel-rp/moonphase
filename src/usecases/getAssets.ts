import { CoinCapPort } from '@/ports/CoinCapPort';
import { Asset } from '@/domain/asset';
export async function getAssets(
  deps: { coinCap: CoinCapPort },
  params: { limit?: number; offset?: number } = {},
): Promise<Asset[]> {
  const { limit = 19, offset = 0 } = params;
  const data = await deps.coinCap.listAssets({ limit, offset });
  return data;
}