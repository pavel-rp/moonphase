import { NextResponse } from 'next/server';
import { isExternalException } from '@/lib/errors';
import { logError } from '@/lib/observability';

/**
 * Shared API route error handler: log, map to HTTP status, return JSON response.
 * Replaces duplicated catch-block logic in API routes.
 */
export function apiErrorResponse(
  error: unknown,
  context: Record<string, unknown>,
): NextResponse {
  logError(error, context);

  if (isExternalException(error)) {
    const status =
      error.kind === 'RateLimited'
        ? 429
        : error.kind === 'InvalidRequest'
          ? 400
          : 502;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 });
}
