import { CoinCapPort } from '@/ports/CoinCapPort';
import { Asset } from '@/domain/asset';
import { get } from './client';
import { DroppedAsset, ListAssetsResponseSchema } from './schema';
import { dedupe, inflightKey } from '@/lib/http/inflight';
import { handleResponse } from '@/lib/http/handleResponse';
import { logError } from '@/lib/observability';
import { COINCAP_DEFAULT_LIMIT, COINCAP_REVALIDATE_S } from '@/lib/config';

// Malformed assets already logged. Cached responses are re-parsed on every
// request, so without this one bad upstream row would be logged on every page.
const reportedDrops = new Set<string>();

function reportDropped(dropped: DroppedAsset[]): void {
  for (const { id, error } of dropped) {
    if (reportedDrops.has(id)) continue;
    reportedDrops.add(id);
    logError(error, { adapter: 'CoinCapAdapter', method: 'listAssets', droppedAsset: id });
  }
}

export class CoinCapAdapter implements CoinCapPort {
  async listAssets(params: { limit?: number; offset?: number } = {}): Promise<Asset[]> {
    const { limit = COINCAP_DEFAULT_LIMIT, offset = 0 } = params;
    const key = inflightKey('coincap/assets', { limit, offset });
    return dedupe(key, async () => {
      const url = `/assets?limit=${limit}&offset=${offset}`;
      try {
        const res = await get(url, { next: { revalidate: COINCAP_REVALIDATE_S } });
        const parsed = await handleResponse(res, ListAssetsResponseSchema, 'CoinCap API');
        reportDropped(parsed.dropped);
        return parsed.data;
      } catch (err) {
        logError(err, { adapter: 'CoinCapAdapter', method: 'listAssets', limit, offset });
        throw err;
      }
    });
  }
}