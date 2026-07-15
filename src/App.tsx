// Root app component — assembles providers and hands control to the router.
//
// The provider stack (outer to inner):
//   ErrorBoundary — catches render errors before they crash the tree
//   QueryClientProvider — server state (TanStack Query)
//   AuthProvider — OIDC / mock / none, selected by runtime config
//   RouterProvider — TanStack Router with the route tree

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { AuthProvider } from './auth/AuthProvider';
import { queryClient } from './api/query-client';
import type { RuntimeConfig } from './config/runtime';
import { router } from './router';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

interface Props {
  config: RuntimeConfig;
}

export function App({ config }: Props) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider config={config}>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
