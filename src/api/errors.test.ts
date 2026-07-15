import { describe, expect, it } from 'vitest';

import { ApiError, normalizeApiError } from './errors';

describe('ApiError', () => {
  it('flags 401 as unauthorized', () => {
    expect(new ApiError(401, 'nope').isUnauthorized).toBe(true);
  });
  it('flags 5xx as retryable', () => {
    expect(new ApiError(500, 'boom').isRetryable).toBe(true);
    expect(new ApiError(404, 'nope').isRetryable).toBe(false);
  });
  it('normalizes a code+correlationId body', () => {
    const err = normalizeApiError(404, {
      code: 'CUSTOMER_NOT_FOUND',
      message: 'nope',
      correlationId: 'abc-123',
    });
    expect(err.code).toBe('CUSTOMER_NOT_FOUND');
    expect(err.correlationId).toBe('abc-123');
    expect(err.status).toBe(404);
  });
  it('falls back to `detail` for backends that use that field', () => {
    const err = normalizeApiError(500, { detail: 'boom' });
    expect(err.message).toBe('boom');
  });
});
