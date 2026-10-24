import { CoinCapPort } from "@/ports/CoinCapPort";
import { AssetWhitelistPort } from "@/ports/AssetWhitelistPort";
import { Asset } from "@/domain/asset";
import { COINCAP_DEFAULT_LIMIT, COINCAP_MAX_REQUEST_LIMIT } from "@/lib/config";

const OVERFETCH_MULTIPLIER = 5; // fetch more to compensate for whitelist filtering

export async function getAssets(
  deps: { coinCap: CoinCapPort; whitelist?: AssetWhitelistPort },
  params: { limit?: number; offset?: number } = {}
): Promise<Asset[]> {
  const { limit = COINCAP_DEFAULT_LIMIT, offset = 0 } = params;
  if (!deps.whitelist) return deps.coinCap.listAssets({ limit, offset });

  const allowed = new Set(
    (await deps.whitelist.listAllowedSymbols()).map((s) => s.toUpperCase())
  );
  // `offset` counts whitelisted assets, not CoinCap ranks, so always read from
  // the top and page after filtering; offsetting upstream makes pages overlap.
  const readWhitelisted = async (requestLimit: number) => {
    const data = await deps.coinCap.listAssets({ limit: requestLimit, offset: 0 });
    const filtered = data.filter((asset) => allowed.has(asset.symbol.toUpperCase()));
    return { filtered, exhausted: data.length < requestLimit };
  };

  const wanted = offset + limit;
  const requestLimit = Math.min(wanted * OVERFETCH_MULTIPLIER, COINCAP_MAX_REQUEST_LIMIT);
  const first = await readWhitelisted(requestLimit);
  // The 5x overfetch assumes at least 1 in 5 ranks is whitelisted. Where that
  // doesn't hold, a short page would skip the assets between it and the next
  // page's deeper read, so read again at full depth instead.
  const short =
    first.filtered.length < wanted && !first.exhausted && requestLimit < COINCAP_MAX_REQUEST_LIMIT;
  const { filtered } = short ? await readWhitelisted(COINCAP_MAX_REQUEST_LIMIT) : first;
  return filtered.slice(offset, offset + limit);
}
