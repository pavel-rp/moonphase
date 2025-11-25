import { z } from 'zod';

// NewsAPI.ai (eventregistry.org) response schema
const NewsAPIaiArticleSchema = z.object({
  uri: z.string(),
  title: z.string(),
  body: z.string().optional().nullable(),
  url: z.string().url(),
  dateTime: z.string(),
  source: z.object({
    uri: z.string(),
    title: z.string(),
  }),
  image: z.string().url().optional().nullable(),
});

export const NewsAPIaiResponseSchema = z.object({
  articles: z.object({
    results: z.array(NewsAPIaiArticleSchema),
    totalResults: z.number(),
  }),
});

// Normalized schema for our domain
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
