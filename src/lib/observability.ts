export function logRequest({ url, method }: { url: string; method?: string }) {
  // eslint-disable-next-line no-console
  console.info(`➡️  ${method ?? 'GET'} ${url}`);
}

export function logError(err: unknown, context?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.error('🟥 Error', { err, ...context });
}