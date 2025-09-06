import { CoinCapAdapter } from '@/adapters/coincap/CoinCapAdapter';
import { JsonWhitelistAdapter } from '@/adapters/whitelist/JsonWhitelistAdapter';
import whitelistData from '@/adapters/whitelist/whitelist.json';
import { getAssets } from '@/usecases/getAssets';
import { Asset } from '@/domain/asset';
export type { Asset };

export async function fetchAssets(): Promise<Asset[]> {
  return getAssets({ coinCap: new CoinCapAdapter(), whitelist: new JsonWhitelistAdapter(whitelistData) });
}
