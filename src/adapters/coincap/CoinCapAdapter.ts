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
      try {
        const res = await get(`/assets?limit=${limit}&offset=${offset}`, { next: { revalidate: 60 } });
        if (res.status === 429) {
          const err: ExternalError = { kind: 'RateLimited', retryAfterSec: Number(res.headers.get('Retry-After') ?? 0) };
          throw err;
        }
        if (!res.ok) {
          const err: ExternalError = { kind: 'Unavailable', details: { status: res.status } };
          throw err;
        }
        const json = await res.json();
        const parsed = ListAssetsResponseSchema.parse(json);
        return parsed.data.map((a) => ({ ...a, explorer: a.explorer ?? '' }));
      } catch (e) {
        if ((e as ExternalError).kind) throw e;
        const err: ExternalError = { kind: 'Unavailable', details: e };
        throw err;
      }
    });
  }
}