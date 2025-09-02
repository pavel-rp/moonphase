import { Asset } from '@/domain/asset';

export interface CoinCapPort {
  listAssets(params?: { limit?: number; offset?: number }): Promise<Asset[]>;
}