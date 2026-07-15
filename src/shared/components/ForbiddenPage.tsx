// 403 — user is authenticated but lacks the required permission.
// Different from the 404 page; users need to know it's a permissions
// issue, not a missing resource.

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-semibold">403 — Forbidden</h1>
        <p className="text-sm text-muted-foreground">
          You don't have permission to view this page. If you think this is a mistake, contact your admin.
        </p>
      </div>
    </div>
  );
}
