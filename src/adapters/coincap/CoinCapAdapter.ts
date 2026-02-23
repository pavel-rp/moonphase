import { CoinCapPort } from '@/ports/CoinCapPort';
import { Asset } from '@/domain/asset';
import { get } from './client';
import { ListAssetsResponseSchema } from './schema';
import { dedupe, inflightKey } from '@/lib/http/inflight';
import { logError } from '@/lib/observability';
import { ExternalException } from '@/lib/errors';

export class CoinCapAdapter implements CoinCapPort {
  async listAssets(params: { limit?: number; offset?: number } = {}): Promise<Asset[]> {
    const { limit = 19, offset = 0 } = params;
    const key = inflightKey('coincap/assets', { limit, offset });
    return dedupe(key, async () => {
      const url = `/assets?limit=${limit}&offset=${offset}`;
      try {
        const res = await get(url, { next: { revalidate: 60 } });
        if (!res || !res.ok) {
          const status = res?.status ?? 500;
          throw new ExternalException(
            status === 429
              ? { kind: 'RateLimited', details: { status } }
              : { kind: 'Unavailable', details: { status } },
            `CoinCap API error ${status}`,
          );
        }
        const json = await res.json();
        const parsed = ListAssetsResponseSchema.parse(json);
        return parsed.data;
      } catch (err) {
        logError(err, { adapter: 'CoinCapAdapter', method: 'listAssets', limit, offset });
        throw err;
      }
    });
  }
}