import { NewsPort } from '@/ports/NewsPort';
import { NewsArticle } from '@/domain/newsArticle';

/**
 * Mock adapter returning deterministic news data for UI development.
 */
export class MockNewsAdapter implements NewsPort {
  async fetchNews(params: { symbol: string; limit?: number }): Promise<NewsArticle[]> {
    const { symbol, limit = 5 } = params;

    // Simulate async delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const mockArticles: NewsArticle[] = [
      {
        title: `${symbol} Reaches New All-Time High Amid Market Rally`,
        description: `Cryptocurrency ${symbol} surged to unprecedented levels as institutional investors show renewed interest.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-ath`,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Crypto News Daily' },
        content: `Full article content about ${symbol} market performance...`,
      },
      {
        title: `Analysts Predict Strong Q2 for ${symbol}`,
        description: `Market analysts are bullish on ${symbol} following recent technical developments.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-q2`,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Blockchain Insights' },
        content: `Analysis of ${symbol} market trends...`,
      },
      {
        title: `${symbol} Network Upgrade Scheduled for Next Month`,
        description: `Developers announce major protocol improvements for ${symbol} blockchain.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-upgrade`,
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Tech Crypto Review' },
        content: `Details about upcoming ${symbol} network changes...`,
      },
      {
        title: `Major Exchange Lists ${symbol} Trading Pairs`,
        description: `Leading cryptocurrency exchange adds ${symbol} to its trading platform.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-listing`,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Exchange News' },
        content: `Details about ${symbol} exchange listing...`,
      },
      {
        title: `${symbol} Community Announces New Partnership`,
        description: `${symbol} foundation partners with major tech company for blockchain integration.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-partnership`,
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Blockchain Today' },
        content: `Partnership details for ${symbol}...`,
      },
    ];

    return mockArticles.slice(0, limit);
  }
}
