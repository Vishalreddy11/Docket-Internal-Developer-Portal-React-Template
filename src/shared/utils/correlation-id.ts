// Correlation ID generator — every API request gets one.
//
// Backend echoes it back in error responses (see ApiError.correlationId),
// so a support ticket can carry the ID and be traced through logs.

export function newCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
