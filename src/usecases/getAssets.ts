import { CoinCapPort } from "@/ports/CoinCapPort";
import { AssetWhitelistPort } from "@/ports/AssetWhitelistPort";
import { Asset } from "@/domain/asset";
import { COINCAP_MAX_REQUEST_LIMIT } from "@/lib/config";

const OVERFETCH_MULTIPLIER = 5; // fetch more to compensate for whitelist filtering

export async function getAssets(
  deps: { coinCap: CoinCapPort; whitelist?: AssetWhitelistPort },
  params: { limit?: number; offset?: number } = {}
): Promise<Asset[]> {
  const { limit = 19, offset = 0 } = params;
  if (!deps.whitelist) return deps.coinCap.listAssets({ limit, offset });

  // `offset` counts whitelisted assets, not CoinCap ranks, so always read from
  // the top and page after filtering; offsetting upstream makes pages overlap.
  const requestLimit = Math.min(
    (offset + limit) * OVERFETCH_MULTIPLIER,
    COINCAP_MAX_REQUEST_LIMIT
  );
  const data = await deps.coinCap.listAssets({ limit: requestLimit, offset: 0 });
  const allowed = new Set(
    (await deps.whitelist.listAllowedSymbols()).map((s) => s.toUpperCase())
  );
  const filtered = data.filter((asset) =>
    allowed.has(asset.symbol.toUpperCase())
  );
  return filtered.slice(offset, offset + limit);
}
