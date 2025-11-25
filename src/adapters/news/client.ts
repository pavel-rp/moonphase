import { fetchWithRetry } from '@/lib/http/fetcher';
import { getEnv } from '@/lib/env';

const BASE_URL = 'https://newsapi.org/v2';

export async function get(path: string, init?: RequestInit): Promise<Response> {
  const env = getEnv();
  const apiKey = env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error('NEWS_API_KEY not configured');
  }

  const url = new URL(path, BASE_URL);
  url.searchParams.set('apiKey', apiKey);

  return fetchWithRetry(url.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}
