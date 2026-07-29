# Docket — Internal Developer Portal React Template

Enterprise **scaffold** for React internal apps. Ships the cross-cutting
infrastructure that's the same for every internal tool — auth wiring,
API-client conventions, error-handling contract, runtime config,
security headers, deployment plumbing — so teams don't reinvent them.

> **This is a scaffold, not a full starter kit.** It provides
> **architecture + infrastructure**; you bring the **UI patterns**
> (Toast, DataTable, Form wrapper, sidebar, etc.) that fit your team's
> style. See [What's in the box vs. what you'll add](#whats-in-the-box)
> below for the honest scope. Don't expect to fork and immediately ship
> a full internal tool — expect to fork, add ~1 day of UI patterns your
> team wants, then write features from there.

**Runtime:** Node.js 22 build · React 19 · Vite · TypeScript strict ·
Nginx serves the built static assets.

**Deliberately backend-agnostic.** This template does NOT couple to any
specific backend — Go, Python, .NET, Java, Node, whatever. Wire your API
via runtime config; the example feature is generic ("items"), not
domain-specific.

---

## What's in the box

The load-bearing enterprise infrastructure — you'd otherwise re-implement
this per app, so we ship it:

- **Auth abstraction** — `useAuth()` hook + OIDC / mock / none modes +
  `<ProtectedRoute>` + permissions system + prominent swap-out comments
  for SAML / vendor SDKs / basic auth / custom IdP
- **API client** — Axios with correlation-ID header, cookie-based auth,
  401 → login-redirect event, standard error model (`{code, message,
  correlationId}`)
- **Feature-based structure** — `src/features/<name>/{api,components,hooks,pages,schemas,types}`
  layout, with one worked example
- **Design tokens + 5 primitives** — Button, Input, Table, Dialog, Label
  on Radix + Tailwind (a11y-by-default)
- **Error boundary + shared pages** — ErrorBoundary, Loading, 403, 404,
  standard `<ErrorMessage>` showing the correlation ID for support
- **Runtime config over build-time env** — one image, N environments via
  K8s ConfigMap mount at `/config/runtime-config.json`
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy shipped
  in `nginx.conf`; no tokens in JS by design
- **Testing scaffold** — Vitest + React Testing Library + Playwright, one
  worked test of each (unit + e2e)
- **Nginx production container** — runs as non-root, serves static, no
  Node.js in prod runtime (smaller attack surface)
- **K8s manifests** — Namespace + ConfigMap + Deployment + Service
- **MSW dev mocks** — `pnpm dev` shows a working demo without any
  backend running

## What you'll add before shipping

We deliberately don't ship these — teams have strong preferences and
locking them in creates friction. Each is ~30–60 minutes:

| Pattern | Suggested lib |
|---|---|
| Toast / notification | [`sonner`](https://sonner.emilkowal.ski/) |
| Confirmation dialog | wrap the shipped `<Dialog>` |
| Data table with sort / paginate / filter | [`@tanstack/react-table`](https://tanstack.com/table) on top of the shipped `<Table>` |
| Form wrapper components (`<Form>`, `<FormField>`, `<FormMessage>`) | shadcn/ui form recipe |
| Sidebar navigation layout | see `TODO(ux)` in [`src/shared/components/AppShell.tsx`](src/shared/components/AppShell.tsx) |
| Skeleton loading | replace the spinner in [`Loading.tsx`](src/shared/components/Loading.tsx) |
| Empty state component | extract from `<ItemList>` |
| Command palette (⌘K) | [`cmdk`](https://cmdk.paco.me/) |
| Dark mode toggle | CSS vars are in place; add theme provider |
| CI workflow | `.github/workflows/ci.yml` — `pnpm typecheck && lint && test && build && test:e2e` |

If your team has a design system (Material, Ant, internal), swap the
primitives in [`src/ui/`](src/ui/) for their equivalents — the rest of
the template doesn't care.

---

## Quick start

Prereqs: Node.js 22, pnpm 9+, Docker (for the container build).

```bash
# 1. Install deps
pnpm install

# 2. MSW service worker — `pnpm install` regenerates it into public/ automatically
#    (via the msw.workerDirectory config). It's gitignored, so run this manually
#    if it's ever missing. Dev-only; not used in production builds.
pnpm exec msw init public/ --save

# 3. Dev — MSW mocks the API so you see a working CRUD demo out-of-the-box
pnpm dev
# Open http://localhost:5173

# 4. Tests
pnpm typecheck
pnpm test
pnpm test:e2e

# 5. Production build
pnpm build

# 6. Container
docker compose up -d --build
# Open http://localhost:8080
```

## What you get out of the box

Open http://localhost:5173 after `pnpm dev`:

1. **Login page** — currently in `mock` mode so it auto-signs-you-in.
2. **Dashboard** (redirects `/` → `/items`).
3. **Items list** — MSW-mocked data.
4. **Create item form** — react-hook-form + Zod validation.
5. **Item detail page** — deep link, dynamic route.
6. **Permission-gated delete button** — mock user has `items:delete`.
7. **Signed-in user + Sign-out** in the header.
8. **Reference ID in error messages** — for support traceability.

The MSW handlers are in [`src/mocks/`](src/mocks/). Turn them off by
setting `VITE_AUTH_MODE=oidc` (or removing the mock branch from
[`src/main.tsx`](src/main.tsx)).

## Directory layout

```
.
├── public/
│   ├── config/
│   │   └── runtime-config.json      # dev runtime config; K8s ConfigMap overrides in prod
│   └── mockServiceWorker.js         # gitignored; regenerated on install / `msw init`
├── src/
│   ├── main.tsx                     # composition root
│   ├── App.tsx                      # provider stack
│   ├── router.tsx                   # route tree (TanStack Router)
│   ├── config/
│   │   └── runtime.ts               # loads /config/runtime-config.json
│   ├── auth/                        # OIDC / mock / none + useAuth + ProtectedRoute + permissions
│   ├── api/                         # Axios client + errors + TanStack Query config
│   ├── ui/                          # shadcn/ui primitives (Button, Input, Table, Dialog, Label)
│   ├── shared/
│   │   ├── components/              # ErrorBoundary, Loading, AppShell, error pages
│   │   └── utils/                   # cn, correlation-id
│   ├── features/
│   │   └── example-items/           # THE example feature — replace with your domain
│   │       ├── api/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── pages/
│   │       ├── schemas/             # Zod
│   │       └── types/
│   ├── mocks/                       # MSW handlers (dev-only)
│   ├── telemetry/                   # OTel stub (opt-in)
│   ├── styles/                      # Tailwind base
│   └── tests/                       # vitest setup
├── e2e/                             # Playwright specs
├── k8s/                             # nginx Deployment + Service + ConfigMap
├── nginx.conf                       # CSP, gzip, SPA routing, runtime-config mount
├── Dockerfile                       # multi-stage: pnpm build → nginx serve
├── docker-compose.yml
├── vite.config.ts
├── tsconfig.*.json
└── package.json
```

## Configuration

Two mechanisms, one convention.

**Dev** — Vite reads `VITE_*` env vars from `.env.local` (copy from
`.env.example`). Fast iteration; no restart needed for most changes.

**Production** — Nginx serves `/config/runtime-config.json` from a K8s
ConfigMap mount ([`k8s/10-config.yaml`](k8s/10-config.yaml)). One image
runs against N environments; only the ConfigMap differs.

**Anything with `VITE_` prefix or in `runtime-config.json` ships to the
browser.** Do NOT put secrets there. Treat both as publicly readable.

## Auth

Default: `mock` for local dev. Switch to `oidc` in production. Full
swap-out comments (SAML / vendor SDK / basic / custom IdP) in
[`src/auth/auth-config.ts`](src/auth/auth-config.ts).

**Recommended production pattern**: Docket backend is the OIDC client
(not the frontend). Backend does the auth-code + PKCE dance, sets an
HttpOnly session cookie, exposes `GET /me`. Frontend calls `GET /me` on
boot; on 401, redirect to `/login`. No tokens in JS at all.

## Wiring your backend

1. Set `apiBaseUrl` in
   [`public/config/runtime-config.json`](public/config/runtime-config.json)
   (dev) and [`k8s/10-config.yaml`](k8s/10-config.yaml) (prod).
2. Delete
   [`src/features/example-items/`](src/features/example-items/) and copy
   the pattern for your real features under `src/features/<name>/`.
3. Delete [`src/mocks/`](src/mocks/) OR leave it — MSW only runs in dev
   mode; production tree-shakes it out.
4. Regenerate API client types from your backend's OpenAPI spec:
   ```bash
   API_SPEC=https://your-backend/openapi.json make generate-api
   ```
   Output goes to `src/api/generated/schema.ts`.

## Deploy

```bash
# Build the image
docker build -t docket-frontend:dev .

# Local
docker compose up -d --build

# K8s
kubectl apply -f k8s/
```

Nginx serves on port 8080 (no root privileges needed). Runtime config is
mounted at `/config/runtime-config.json` from the ConfigMap so one image
runs against N environments.

## Contribute-back checklist (per feature)

When you add a feature under `src/features/<name>/`:

- [ ] `types/<name>.ts` — plain TS types.
- [ ] `schemas/<name>-schema.ts` — Zod schemas for runtime validation.
- [ ] `api/<name>-api.ts` — HTTP calls, one function per endpoint.
- [ ] `hooks/use-<name>.ts` — TanStack Query hooks (one per query, one per mutation).
- [ ] `components/` — feature-local components.
- [ ] `pages/` — page-level components imported by the router.
- [ ] Add permission strings to [`src/auth/permissions.ts`](src/auth/permissions.ts).
- [ ] Add query keys to [`src/api/query-keys.ts`](src/api/query-keys.ts).
- [ ] Wrap protected routes in `<ProtectedRoute permission="...">`.
- [ ] Test: at least one unit + one e2e.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the design rationale.

## Known gaps

Documented candidly in [`ARCHITECTURE.md`](ARCHITECTURE.md#known-gaps--for-true-enterprise-grade).
Highlights: no feature-flags provider, no i18n scaffold, no telemetry
vendor wired (deliberate — company decision), no CI, no Storybook.
