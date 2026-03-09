import { fetchWithRetry } from '@/lib/http/fetcher';
import { logRequest } from '@/lib/observability';
import { getEnv } from '@/lib/env';
import { COINCAP_TIMEOUT_MS } from '@/lib/config';

const { COINCAP_BASE_URL } = getEnv();
const BASE_URL = COINCAP_BASE_URL ?? 'https://rest.coincap.io/v3';

export async function get(path: string, { next }: { next?: NextFetchRequestConfig } = {}) {
  const { COINCAP_API_KEY } = getEnv();
  const url = `${BASE_URL}${path}`;
  logRequest({ url, method: 'GET' });
  return fetchWithRetry(
    url,
    { next, headers: { Authorization: `Bearer ${COINCAP_API_KEY ?? ''}` } },
    { timeoutMs: COINCAP_TIMEOUT_MS }
  );
}