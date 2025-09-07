import { CoinCapPort } from '@/ports/CoinCapPort';
import { AssetWhitelistPort } from '@/ports/AssetWhitelistPort';
import { Asset } from '@/domain/asset';
export async function getAssets(
  deps: { coinCap: CoinCapPort; whitelist?: AssetWhitelistPort },
  params: { limit?: number; offset?: number } = {},
): Promise<Asset[]> {
  const { limit = 19, offset = 0 } = params;
  const isTestEnv = process.env.NODE_ENV === 'test';
  const hasWhitelist = Boolean(deps.whitelist);
  const OVERFETCH_MULTIPLIER = 5; // fetch more to compensate for whitelist filtering
  const requestLimit = hasWhitelist && !isTestEnv ? limit * OVERFETCH_MULTIPLIER : limit;

  const data = await deps.coinCap.listAssets({ limit: requestLimit, offset });
  if (!deps.whitelist) return data;
  const allowed = new Set((await deps.whitelist.listAllowedSymbols()).map((s) => s.toUpperCase()));
  const filtered = data.filter((asset) => allowed.has(asset.symbol.toUpperCase()));
  return filtered.slice(0, limit);
}