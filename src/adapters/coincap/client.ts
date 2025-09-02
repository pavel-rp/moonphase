import { fetchWithRetry } from '@/lib/http/fetcher';
import { logRequest } from '@/lib/observability';

const DEFAULT_BASE_URL = 'https://rest.coincap.io/v3';

function getBaseUrl(): string {
  return process.env.COINCAP_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function get(path: string, { next }: { next?: NextFetchRequestConfig } = {}) {
  const baseUrl = getBaseUrl();
  const urlObject = new URL(`${baseUrl}${path}`);
  const apiKey = process.env.COINCAP_API_KEY;
  if (apiKey) {
    urlObject.searchParams.set('apiKey', apiKey);
  }
  const url = urlObject.toString();
  logRequest({ url, method: 'GET' });
  return fetchWithRetry(
    url,
    { next },
    { timeoutMs: 10_000 }
  );
}