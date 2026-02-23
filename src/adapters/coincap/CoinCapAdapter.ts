import { CoinCapPort } from '@/ports/CoinCapPort';
import { Asset } from '@/domain/asset';
import { get } from './client';
import { ListAssetsResponseSchema } from './schema';
import { dedupe, inflightKey } from '@/lib/http/inflight';
import { handleResponse } from '@/lib/http/handleResponse';
import { logError } from '@/lib/observability';

export class CoinCapAdapter implements CoinCapPort {
  async listAssets(params: { limit?: number; offset?: number } = {}): Promise<Asset[]> {
    const { limit = 19, offset = 0 } = params;
    const key = inflightKey('coincap/assets', { limit, offset });
    return dedupe(key, async () => {
      const url = `/assets?limit=${limit}&offset=${offset}`;
      try {
        const res = await get(url, { next: { revalidate: 60 } });
        const parsed = await handleResponse(res, ListAssetsResponseSchema, 'CoinCap API');
        return parsed.data;
      } catch (err) {
        logError(err, { adapter: 'CoinCapAdapter', method: 'listAssets', limit, offset });
        throw err;
      }
    });
  }
}