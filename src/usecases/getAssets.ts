import { CoinCapPort } from '@/ports/CoinCapPort';
import { AssetWhitelistPort } from '@/ports/AssetWhitelistPort';
import { Asset } from '@/domain/asset';
export async function getAssets(
  deps: { coinCap: CoinCapPort; whitelist?: AssetWhitelistPort },
  params: { limit?: number; offset?: number } = {},
): Promise<Asset[]> {
  const { limit = 19, offset = 0 } = params;
  const data = await deps.coinCap.listAssets({ limit, offset });
  if (!deps.whitelist) return data;
  const allowed = new Set((await deps.whitelist.listAllowedSymbols()).map((s) => s.toUpperCase()));
  return data.filter((asset) => allowed.has(asset.symbol.toUpperCase()));
}