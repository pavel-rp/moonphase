export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string | null;
}
