import { fetchWithRetry } from '@/lib/http/fetcher';
import { getEnv } from '@/lib/env';

// NewsAPI.ai uses eventregistry.org as the base URL
const BASE_URL = 'https://eventregistry.org/api/v1';

export async function get(path: string, init?: RequestInit): Promise<Response> {
  const env = getEnv();
  const apiKey = env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error('NEWS_API_KEY not configured');
  }

  // Remove leading slash from path if present to properly join with BASE_URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const fullUrl = `${BASE_URL}/${cleanPath}`;

  const url = new URL(fullUrl);
  url.searchParams.set('apiKey', apiKey);

  return fetchWithRetry(url.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}
