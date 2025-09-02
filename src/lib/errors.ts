export type ExternalError =
  | { kind: 'RateLimited'; retryAfterSec?: number; details?: unknown }
  | { kind: 'Unavailable'; details?: unknown }
  | { kind: 'InvalidRequest'; details?: unknown };