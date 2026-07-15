// Route definitions.
//
// Uses TanStack Router — chosen over React Router for better type inference
// on route params and search state.
//
// Patterns:
//   - Public routes (/, /login, /callback, /forbidden, /not-found) render
//     without an auth check.
//   - Protected routes wrap their component in <ProtectedRoute> which
//     redirects to /login on 401 or renders <Forbidden> on 403.

import {
  Outlet,
  RootRoute,
  Route,
  Router,
  redirect,
} from '@tanstack/react-router';

import { ProtectedRoute } from './auth/ProtectedRoute';
import { ItemsListPage } from './features/example-items/pages/ItemsListPage';
import { ItemDetailPage } from './features/example-items/pages/ItemDetailPage';
import { AppShell } from './shared/components/AppShell';
import { CallbackPage } from './auth/CallbackPage';
import { ForbiddenPage } from './shared/components/ForbiddenPage';
import { LoginPage } from './auth/LoginPage';
import { NotFoundPage } from './shared/components/NotFoundPage';

const rootRoute = new RootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/items' });
  },
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const callbackRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/callback',
  component: CallbackPage,
});

const forbiddenRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/forbidden',
  component: ForbiddenPage,
});

const itemsListRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/items',
  component: () => (
    <ProtectedRoute permission="items:read">
      <ItemsListPage />
    </ProtectedRoute>
  ),
});

const itemDetailRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/items/$id',
  component: () => (
    <ProtectedRoute permission="items:read">
      <ItemDetailPage />
    </ProtectedRoute>
  ),
});

const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  callbackRoute,
  forbiddenRoute,
  itemsListRoute,
  itemDetailRoute,
  notFoundRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
