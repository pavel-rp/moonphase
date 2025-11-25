import { NewsArticle } from '@/domain/newsArticle';

export interface NewsPort {
  fetchNews(params: { symbol: string; limit?: number }): Promise<NewsArticle[]>;
}
