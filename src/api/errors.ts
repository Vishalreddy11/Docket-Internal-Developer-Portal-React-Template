// Standard API error model.
//
// Enterprise backends should return errors in this shape (matches the
// Go / Python / TypeScript Docket backend templates' convention):
//
//   {
//     "code": "CUSTOMER_NOT_FOUND",
//     "message": "The requested customer was not found.",
//     "correlationId": "a719d810-36ed-4e49"
//   }
//
// If your backend returns a different shape, adapt normalizeApiError below.

export interface ApiErrorBody {
  code?: string;
  message?: string;
  correlationId?: string;
  detail?: string; // fallback for backends that use `detail`
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly correlationId: string | undefined;
  readonly body: ApiErrorBody | undefined;

  constructor(
    status: number,
    message: string,
    opts: { code?: string; correlationId?: string; body?: ApiErrorBody } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = opts.code ?? `HTTP_${status}`;
    this.correlationId = opts.correlationId;
    this.body = opts.body;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isConflict(): boolean {
    return this.status === 409;
  }
  get isRetryable(): boolean {
    return this.status >= 500 || this.status === 429;
  }
}

export function normalizeApiError(status: number, raw: unknown): ApiError {
  const body = (typeof raw === 'object' && raw !== null ? raw : {}) as ApiErrorBody;
  const message = body.message ?? body.detail ?? `HTTP ${status}`;
  return new ApiError(status, message, {
    code: body.code,
    correlationId: body.correlationId,
    body,
  });
}
