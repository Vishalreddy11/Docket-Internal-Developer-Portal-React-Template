// Inline error display — the "friendly error" pattern that includes the
// correlationId so support can trace the failure through backend logs.

import { ApiError } from '@/api/errors';

interface Props {
  error: unknown;
}

export function ErrorMessage({ error }: Props) {
  const apiErr = error instanceof ApiError ? error : null;
  const message = apiErr?.message ?? (error instanceof Error ? error.message : 'Unknown error');

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm"
    >
      <p className="font-medium">We couldn't complete your request.</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      {apiErr?.correlationId && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Reference ID: {apiErr.correlationId}
        </p>
      )}
    </div>
  );
}
