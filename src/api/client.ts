// HTTP client — Axios instance with enterprise defaults.
//
// Deliberately NOT wired to any specific backend. The base URL comes from
// runtime config (apiBaseUrl). Developers add their endpoints per feature
// under src/features/<feature>/api/.
//
// What this client handles automatically:
//   - Correlation ID header (X-Request-Id) — generated per request, echoed
//     back by well-behaved backends for grep-able tracing.
//   - Sends the cookie (withCredentials) so an HttpOnly session cookie set
//     by an OIDC / SAML backend is included on every call.
//   - 401 -> emit an 'auth:unauthorized' event so the app can redirect to
//     login. UI code listens; the client stays pure.
//   - Timeouts (10s default).
//   - JSON serialization + normalized error objects.
//
// NOT provided (deliberate — the backend and BFF handle these):
//   - Bearer token attachment (there IS no token in JS with the cookie flow).
//   - Retry logic (retrying POST is dangerous; do it per-hook where it's safe).
//   - Global request-body encryption (backend/TLS handles it).

import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

import { getRuntimeConfig } from '@/config/runtime';
import { newCorrelationId } from '@/shared/utils/correlation-id';
import { ApiError, normalizeApiError } from './errors';

const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export function emitUnauthorized() {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function onUnauthorized(cb: () => void) {
  window.addEventListener(UNAUTHORIZED_EVENT, cb);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, cb);
}

let client: AxiosInstance | undefined;

export function getApiClient(): AxiosInstance {
  if (client) return client;

  const cfg = getRuntimeConfig();
  client = axios.create({
    baseURL: cfg.apiBaseUrl || '/api',
    timeout: 10_000,
    withCredentials: true, // send HttpOnly session cookie
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    config.headers.set('X-Request-Id', newCorrelationId());
    return config;
  });

  client.interceptors.response.use(
    (res: AxiosResponse) => res,
    (err: AxiosError) => {
      const status = err.response?.status ?? 0;
      const apiErr: ApiError = err.response
        ? normalizeApiError(status, err.response.data)
        : new ApiError(0, err.message || 'network error');

      if (apiErr.isUnauthorized) {
        emitUnauthorized();
      }
      return Promise.reject(apiErr);
    },
  );

  return client;
}
