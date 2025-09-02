import { CoinCapPort } from '@/ports/CoinCapPort';
import { Asset } from '@/domain/asset';
import { get } from './client';
import { ListAssetsResponseSchema } from './schema';
import { ExternalError } from '@/lib/errors';
import { dedupe, inflightKey } from '@/lib/http/inflight';

export class CoinCapAdapter implements CoinCapPort {
  async listAssets(params: { limit?: number; offset?: number } = {}): Promise<Asset[]> {
    const { limit = 19, offset = 0 } = params;
    const key = inflightKey('coincap/assets', { limit, offset });
    return dedupe(key, async () => {
      const res = await get(`/assets?limit=${limit}&offset=${offset}`, { next: { revalidate: 60 } });
      if (!res || !res.ok) {
        throw new Error(`API error ${res?.status ?? 500}`);
      }
      const json = await res.json();
      const parsed = ListAssetsResponseSchema.parse(json);
      return parsed.data;
    });
  }
}