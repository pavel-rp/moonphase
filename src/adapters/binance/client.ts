import { fetchWithRetry } from '@/lib/http/fetcher';
import { logRequest } from '@/lib/observability';
import { getEnv } from '@/lib/env';
import { BINANCE_TIMEOUT_MS } from '@/lib/config';

const { BINANCE_BASE_URL } = getEnv();
const BASE_URL = BINANCE_BASE_URL ?? 'https://api.binance.com/api/v3';

export async function get(
  path: string,
  { next }: { next?: NextFetchRequestConfig } = {},
) {
  const { BINANCE_API_KEY } = getEnv();
  const url = `${BASE_URL}${path}`;
  logRequest({ url, method: 'GET' });
  const headers: HeadersInit = {};
  if (BINANCE_API_KEY) {
    headers['X-MBX-APIKEY'] = BINANCE_API_KEY;
  }
  return fetchWithRetry(
    url,
    { next, headers },
    { timeoutMs: BINANCE_TIMEOUT_MS },
  );
}

