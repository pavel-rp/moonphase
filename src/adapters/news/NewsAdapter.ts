import { NewsPort } from '@/ports/NewsPort';
import { NewsArticle } from '@/domain/newsArticle';
import { dedupe, inflightKey } from '@/lib/http/inflight';
import { get } from './client';
import { NewsAPIaiResponseSchema } from './schema';
import { logRequest, logError } from '@/lib/observability';
import { ExternalException } from '@/lib/errors';

export class NewsAdapter implements NewsPort {
  async fetchNews(params: { symbol: string; limit?: number }): Promise<NewsArticle[]> {
    const { symbol, limit = 5 } = params;
    const key = inflightKey('news/newsapiai', { symbol, limit });

    return dedupe(key, async () => {
      try {
        // Map common crypto symbols to full names for better search results
        const symbolMap: Record<string, string> = {
          BTC: 'Bitcoin',
          ETH: 'Ethereum',
          USDT: 'Tether',
          BNB: 'Binance',
          SOL: 'Solana',
          XRP: 'Ripple',
          ADA: 'Cardano',
          DOGE: 'Dogecoin',
          AVAX: 'Avalanche',
          DOT: 'Polkadot',
          MATIC: 'Polygon',
          LINK: 'Chainlink',
        };

        const searchTerm = symbolMap[symbol] || symbol;

        // NewsAPI.ai uses /article/getArticles endpoint
        const query = new URLSearchParams({
          keyword: `${searchTerm} cryptocurrency`,
          keywordOper: 'and',
          lang: 'eng',
          articlesSortBy: 'date',
          articlesCount: String(limit),
          resultType: 'articles',
        });

        const url = `/article/getArticles?${query.toString()}`;
        logRequest({ url, method: 'GET' });

        let res: Response;
        try {
          res = await get(url, { next: { revalidate: 300 } as never });
        } catch (fetchError) {
          logError(fetchError, { symbol, limit, stage: 'fetch' });
          throw fetchError;
        }

        if (!res || !res.ok) {
          const status = res?.status ?? 500;
          const errorText = await res?.text?.();
          logError(new ExternalException(
            { kind: 'Unavailable', details: { status, errorText } },
            `NewsAPI.ai ${status}: ${errorText}`,
          ), { symbol, limit, url });
          throw new ExternalException(
            status === 429
              ? { kind: 'RateLimited', details: { status } }
              : { kind: 'Unavailable', details: { status, errorText } },
            `NewsAPI.ai error ${status}`,
          );
        }

        const json = await res.json();
        const parsed = NewsAPIaiResponseSchema.parse(json);

        // Transform NewsAPI.ai response to our domain model
        const articles: NewsArticle[] = parsed.articles.results.map((article) => ({
          title: article.title,
          description: article.body?.substring(0, 200) || null,
          url: article.url,
          publishedAt: article.dateTime,
          source: {
            name: article.source.title,
          },
          content: article.body || null,
        }));

        return articles;
      } catch (err) {
        logError(err, { symbol, limit });
        // Graceful degradation: return empty array on failure
        return [];
      }
    });
  }
}
