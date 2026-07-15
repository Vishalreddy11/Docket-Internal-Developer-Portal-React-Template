# Architecture — Docket React Template

Enterprise-standard React 19 + Vite + TypeScript template. Ships all the
cross-cutting infrastructure a developer would otherwise re-invent per app
— auth, API client, error handling, routing, permissions, design system,
runtime config, security headers, testing scaffolding.

**Deliberately NOT wired to any specific backend.** The person forking this
may run a Java, .NET, Go, Python, Node, or anything-else backend. The
template gives them the frontend contract; they wire the URL and API shape.

## TL;DR

- **Composition Root** in [`src/main.tsx`](src/main.tsx) — the only place
  runtime config loads, MSW starts, and the React root mounts.
- **Provider stack** in [`src/App.tsx`](src/App.tsx) — ErrorBoundary →
  QueryClient → Auth → Router.
- **Auth abstraction** in [`src/auth/`](src/auth/) — one `useAuth()` hook
  that hides OIDC / mock / none behind a uniform interface.
- **API client** in [`src/api/client.ts`](src/api/client.ts) — Axios with
  correlation-ID header, cookie-based auth, 401 event, standard error model.
- **Feature slice** in [`src/features/example-items/`](src/features/example-items/)
  — the pattern forkers copy per business feature.
- **Design system primitives** in [`src/ui/`](src/ui/) — shadcn/ui subset
  (Button, Input, Table, Dialog, Label) on Radix + Tailwind.
- **MSW mocks** in [`src/mocks/`](src/mocks/) — dev-only fake backend so
  `pnpm dev` shows a working CRUD demo without any real API.

## Patterns applied

| Pattern | File / evidence |
|---|---|
| **Composition Root** | [`src/main.tsx`](src/main.tsx) — the only place the app boots. Runtime config loaded first; MSW conditionally started; React root mounted. |
| **Provider composition** | [`src/App.tsx`](src/App.tsx) — the provider stack is one file, top-to-bottom, obvious. |
| **Runtime config over build-time env** | [`src/config/runtime.ts`](src/config/runtime.ts) — one image, N environments. Nginx serves `/config/runtime-config.json` from a K8s ConfigMap. |
| **Adapter pattern (auth)** | [`src/auth/AuthProvider.tsx`](src/auth/AuthProvider.tsx) — OIDC / mock / none each satisfy the same `AuthState` interface. Feature code sees `useAuth()`, never the underlying lib. |
| **Feature-based structure** | [`src/features/<name>/`](src/features/) — everything a feature needs (api, hooks, pages, components, schemas, types) lives together. Team scale by feature, not by layer. |
| **CQRS-lite via TanStack Query** | `useItemsList` / `useItem` for reads (cached), `useCreateItem` / `useDeleteItem` for writes (invalidate on success). See [`src/features/example-items/hooks/use-items.ts`](src/features/example-items/hooks/use-items.ts). |
| **Runtime validation at boundaries** | Zod schemas in [`src/features/example-items/schemas/item-schema.ts`](src/features/example-items/schemas/item-schema.ts) validate every API response. |
| **Chain of Responsibility (Axios interceptors)** | [`src/api/client.ts`](src/api/client.ts) — request interceptor (correlation ID) → server → response interceptor (401 event, error normalization). |
| **Event-driven auth recovery** | 401 API errors dispatch `auth:unauthorized`; `AppShell` listens and redirects to `/login`. Client stays pure; UI decides recovery. |
| **Standard error model** | [`src/api/errors.ts`](src/api/errors.ts) — `{ code, message, correlationId }` matches the Docket backend templates. Ref ID shown in `<ErrorMessage>` so support can trace. |
| **Central query-key registry** | [`src/api/query-keys.ts`](src/api/query-keys.ts) — one source of truth for cache invalidation. |
| **Route-level permission gates** | `<ProtectedRoute permission="items:read">` in [`src/router.tsx`](src/router.tsx). Component-level gates via `hasPermission()` inside components. |

## SOLID

**S — Single Responsibility.** Modules do one thing:
- `config/runtime.ts` reads settings.
- `api/client.ts` makes HTTP requests.
- `api/errors.ts` normalizes errors.
- `auth/AuthProvider.tsx` handles auth dispatch.
- Each feature owns its domain.

**O — Open/Closed.** Extension without modification:
- Add a new backend endpoint? Add a hook in `src/features/<name>/hooks/`; existing code untouched.
- Add a new permission? Append to `src/auth/permissions.ts`.
- Swap auth libs? Rewrite `src/auth/AuthProvider.tsx`; feature code stays the same.

**L — Liskov Substitution.** All three auth modes (OIDC / mock / none)
satisfy the same `AuthState` interface. `useAuth()` behaves the same
either way — components don't branch on mode.

**I — Interface Segregation.** `useAuth()` exposes exactly what a
component needs: `user`, `isAuthenticated`, `hasPermission`, `signIn`,
`signOut`. Not a bag of every auth internal.

**D — Dependency Inversion.** Feature components depend on `useAuth()`
and TanStack Query hooks — never on `react-oidc-context`, `axios`, or
underlying libs directly.

## Security defaults

- **No tokens in JS**. If your backend does OIDC, it sets an HttpOnly
  session cookie; the frontend never holds a bearer token. XSS-token-theft
  is impossible if there are no tokens to steal.
- **CSP header** shipped in [`nginx.conf`](nginx.conf) — tighten the
  `connect-src` / `img-src` / `style-src` lists per environment.
- **`X-Frame-Options: DENY`** — no clickjacking.
- **`X-Content-Type-Options: nosniff`** — no MIME confusion.
- **`Referrer-Policy: strict-origin-when-cross-origin`** — no leaking URLs
  with IDs to third-party origins.
- **Zod validation** at every API boundary — no unchecked `.length` on
  something the backend didn't actually send.
- **shadcn/ui + Radix** — accessible by default, no `dangerouslySetInnerHTML`.
- **Correlation ID** on every request — support can trace an incident
  through frontend + backend logs.

## Known gaps — for true enterprise-grade

This template is a **scaffold**, not a full starter. It provides
architecture + infrastructure; UI patterns are intentionally minimal so
teams pick their own. Be honest with your team about what still needs
building before the first real feature ships.

### UI patterns you'll add (~1 day of work total)

The moment you build a real internal tool you'll hit these. Each is
30–60 minutes, and shipping them across the org would lock everyone into
one style, which is why we don't.

- **Toast / notification** — right now, a successful mutation gives no
  visual feedback. Recommend [`sonner`](https://sonner.emilkowal.ski/)
  wired via a `<Toaster />` in `App.tsx` and a `toast.success(...)` call
  in mutation `onSuccess`.
- **Confirmation dialog** — the delete button in
  [`ItemList.tsx`](src/features/example-items/components/ItemList.tsx)
  calls `mutate()` directly. Wrap the shipped `<Dialog>` into a
  `<ConfirmDialog>` component; use it before destructive actions.
- **Data table** with sort / pagination / filter — the shipped
  `<Table>` is markup only. Layer
  [`@tanstack/react-table`](https://tanstack.com/table) on top for real
  behavior.
- **Form wrapper** — every form re-invents `<Label>` + `<Input>` +
  error-text layout. Extract `<Form>` / `<FormField>` /
  `<FormMessage>` (see the shadcn/ui form recipe).
- **Sidebar navigation layout** — [`AppShell`](src/shared/components/AppShell.tsx)
  has top-nav only. See the `TODO(ux)` marker there for where to add
  a left rail; enterprise internal tools almost always expect one.
- **Skeleton loading** — only a spinner ships in
  [`Loading.tsx`](src/shared/components/Loading.tsx). Add per-shape
  skeletons for tables, cards, details.
- **Empty state component** — `<ItemList>` uses an ad-hoc `<p>`. Extract
  a reusable `<EmptyState icon message action?>`.
- **Command palette (⌘K)** — enterprise UX expectation.
  [`cmdk`](https://cmdk.paco.me/) is the standard.
- **Dark mode toggle** — CSS vars are wired in
  [`globals.css`](src/styles/globals.css) but there's no theme provider
  or toggle UI. Add `next-themes` or a small localStorage-backed
  provider.

### Infrastructure / process gaps

- **No feature flags** — add [Unleash](https://www.getunleash.io/) /
  [LaunchDarkly](https://launchdarkly.com/) / a JSON-file provider when
  you need gradual rollout.
- **No i18n** — wrap strings in `t()` on day 0 (`react-i18next`) even if
  English-only. Retrofitting later is a year of work.
- **No client-side telemetry wired** — see
  [`src/telemetry/otel.ts`](src/telemetry/otel.ts). Deliberate — vendor
  SDK choice is a company decision.
- **No CI** — add `.github/workflows/ci.yml` running
  `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, plus
  `pnpm test:e2e` on PRs and image scans.
- **No Storybook** — highly recommended once the design system grows
  beyond the 5 primitives.
- **Bundle-size budget only via Vite's `chunkSizeWarningLimit`** — add
  [`size-limit`](https://github.com/ai/size-limit) in CI for enforcement.

### Honest calibration for adopters

- **Junior devs**: get real value — auth, error handling, API contract,
  and deployment plumbing they'd otherwise fumble.
- **Senior engineers**: architecture is sound (SOLID, DI, feature-based,
  Radix a11y primitives) but expect ~1 day of "add UI infra before I
  can write features." Set that expectation upfront and they'll respect
  the scope decision.

## Extension points

When forking:

- **Replace the domain** — swap [`src/features/example-items/`](src/features/example-items/)
  with your real features. Delete the example.
- **Wire your backend** — set `apiBaseUrl` in
  [`runtime-config.json`](public/config/runtime-config.json) and adjust
  the endpoint paths in each feature's `api/` folder.
- **Wire your IdP** — set `authMode: "oidc"` + fill the OIDC fields in
  runtime config. If not OIDC, see the swap-out comments in
  [`src/auth/auth-config.ts`](src/auth/auth-config.ts).
- **Add a permission** — append to
  [`src/auth/permissions.ts`](src/auth/permissions.ts); reference in
  `<ProtectedRoute>` or `hasPermission()`.
- **Add a UI primitive** — copy from
  [shadcn/ui](https://ui.shadcn.com/) into `src/ui/`.
- **Regenerate API types** — `API_SPEC=https://your-backend/openapi.json make generate-api`.

See [`README.md`](README.md) for the operational side; this file is the
design side.
