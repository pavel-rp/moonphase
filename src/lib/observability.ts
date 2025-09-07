export function logRequest({ url, method }: { url: string; method?: string }) {
  console.info(`➡️  ${method ?? 'GET'} ${url}`);
}

export function logError(err: unknown, context?: Record<string, unknown>) {
  console.error('🟥 Error', { err, ...context });
}