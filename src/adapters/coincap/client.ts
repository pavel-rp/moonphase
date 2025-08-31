import { fetchWithRetry } from '@/lib/http/fetcher';
import { logRequest } from '@/lib/observability';
import { getEnv } from '@/lib/env';

const BASE_URL = 'https://rest.coincap.io/v3';

export async function get(path: string, { next }: { next?: NextFetchRequestConfig } = {}) {
  const { COINCAP_API_KEY } = getEnv();
  const url = `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}apiKey=${COINCAP_API_KEY ?? ''}`;
  logRequest({ url, method: 'GET' });
  return fetchWithRetry(url, { next }, { timeoutMs: 10_000 });
}