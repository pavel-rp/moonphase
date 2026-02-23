import type { ZodType, ZodTypeDef } from 'zod';
import { ExternalException } from '@/lib/errors';

/**
 * Shared HTTP response handler: check status → parse JSON → validate schema.
 * Throws ExternalException on non-ok responses with status and error body context.
 */
export async function handleResponse<T>(
  res: Response | null | undefined,
  schema: ZodType<T, ZodTypeDef, unknown>,
  label: string,
): Promise<T> {
  if (!res || !res.ok) {
    const status = res?.status ?? 500;

    let body: unknown;
    if (res) {
      try {
        body = await res.clone().json();
      } catch {
        try {
          body = await res.clone().text();
        } catch {
          // ignore — body stays undefined
        }
      }
    }

    throw new ExternalException(
      status === 429
        ? { kind: 'RateLimited', details: { status, body } }
        : { kind: 'Unavailable', details: { status, body } },
      `${label} error ${status}`,
    );
  }

  const json = await res.json();
  return schema.parse(json);
}
