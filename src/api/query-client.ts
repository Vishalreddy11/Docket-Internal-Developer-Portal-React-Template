// TanStack Query client — server-state cache config.
//
// Defaults chosen for enterprise internal apps:
//   - staleTime 30s so tab-switches don't re-fetch endlessly
//   - retry 1 on failures other than 4xx (auth / validation should not retry)
//   - refetchOnWindowFocus disabled — noisy for internal tools

import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && !error.isRetryable) return false;
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false, // never auto-retry mutations — caller decides.
    },
  },
});
