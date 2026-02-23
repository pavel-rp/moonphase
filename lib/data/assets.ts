import { getAssets } from '@/usecases/getAssets';
import { assetsDeps } from '@/compositionRoot';
import { Asset } from '@/domain/asset';
export type { Asset };

export async function fetchAssets(params?: { limit?: number; offset?: number }): Promise<Asset[]> {
  return getAssets(assetsDeps, params);
}
