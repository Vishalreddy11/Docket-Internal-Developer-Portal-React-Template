export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-semibold">404 — Not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
