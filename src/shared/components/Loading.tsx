// Loading indicator — used across route guards and async boundaries.
// Kept intentionally minimal; forkers usually replace with a design-system
// spinner or skeleton.

export function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
