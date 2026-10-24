import { NewsArticle } from '@/domain/newsArticle';

export interface NewsPort {
  /**
   * Returns recent articles about the symbol; a failed fetch degrades to `[]`.
   * `signal` cancels the fetch (e.g. on client disconnect): an aborted call
   * rejects with the signal's reason. Concurrent identical requests share one
   * upstream fetch, which is cancelled only once every caller has aborted.
   */
  fetchNews(params: { symbol: string; limit?: number; signal?: AbortSignal }): Promise<NewsArticle[]>;
}
