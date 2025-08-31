import { CoinCapAdapter } from '@/adapters/coincap/CoinCapAdapter';
import { getAssets } from '@/usecases/getAssets';
import { Asset } from '@/domain/asset';
export type { Asset };

export async function fetchAssets(): Promise<Asset[]> {
  return getAssets({ coinCap: new CoinCapAdapter() });
}
