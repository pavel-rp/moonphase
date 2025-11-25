import { z } from 'zod';

export const NewsArticleSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  url: z.string().url(),
  publishedAt: z.string(),
  source: z.object({
    name: z.string(),
  }),
  content: z.string().nullable(),
});

export const NewsResponseSchema = z.object({
  status: z.literal('ok'),
  totalResults: z.number(),
  articles: z.array(NewsArticleSchema),
});
