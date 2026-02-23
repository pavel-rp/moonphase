export type ExternalError =
  | { kind: 'RateLimited'; retryAfterSec?: number; details?: unknown }
  | { kind: 'Unavailable'; details?: unknown }
  | { kind: 'InvalidRequest'; details?: unknown };

export class ExternalException extends Error {
  readonly kind: ExternalError['kind'];
  readonly details?: unknown;
  readonly retryAfterSec?: number;

  constructor(error: ExternalError, message?: string) {
    super(message ?? error.kind);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'ExternalException';
    this.kind = error.kind;
    this.details = error.details;
    if (error.kind === 'RateLimited') {
      this.retryAfterSec = error.retryAfterSec;
    }
  }
}

export function isExternalException(err: unknown): err is ExternalException {
  return err instanceof ExternalException;
}
