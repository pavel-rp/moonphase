import { NewsPort } from '@/ports/NewsPort';
import { NewsArticle } from '@/domain/newsArticle';
import { dedupe, inflightKey } from '@/lib/http/inflight';
import { get } from './client';
import { NewsResponseSchema } from './schema';
import { logRequest, logError } from '@/lib/observability';

export class NewsAdapter implements NewsPort {
  async fetchNews(params: { symbol: string; limit?: number }): Promise<NewsArticle[]> {
    const { symbol, limit = 5 } = params;
    const key = inflightKey('news/everything', { symbol, limit });

    return dedupe(key, async () => {
      try {
        const query = new URLSearchParams({
          q: symbol,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: String(limit),
        });

        const url = `/everything?${query.toString()}`;
        logRequest({ url, method: 'GET' });

        const res = await get(url, { next: { revalidate: 300 } as never }); // 5min cache

        if (!res || !res.ok) {
          throw new Error(`NewsAPI error ${res?.status ?? 500}`);
        }

        const json = await res.json();
        const parsed = NewsResponseSchema.parse(json);
        return parsed.articles;
      } catch (err) {
        logError(err, { symbol, limit });
        // Graceful degradation: return empty array on failure
        return [];
      }
    });
  }
}
