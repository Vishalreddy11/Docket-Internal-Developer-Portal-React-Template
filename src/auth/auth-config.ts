// Auth mode selection and OIDC config shape.
//
// The template ships with three modes:
//
//   oidc  — production: OIDC / OAuth 2.0 + PKCE via react-oidc-context.
//           IdP-agnostic — works with Keycloak, Auth0, Okta, Entra ID,
//           and any OIDC-compliant IdP.
//   mock  — local dev: skip login, inject a fake authenticated user.
//   none  — public app: bypass auth entirely (remove ProtectedRoute
//           wrappers from src/router.tsx as well).
//
// ============================================================================
// TODO(auth-swap): Not using OIDC? Swap the AuthProvider implementation.
//
// Common enterprise choices and where to plug them in:
//
// * SAML SSO — Frontend rarely handles SAML directly. Your backend acts as
//   the SAML SP (service provider), the browser gets a session cookie
//   after the SAML dance, and the frontend just needs to know "am I
//   logged in?". Replace src/auth/AuthProvider.tsx with a version that
//   calls GET /me on mount and treats any 401 as "not logged in". Skip
//   OIDC entirely.
//
// * Vendor SDKs — @auth0/auth0-react, @azure/msal-react, aws-amplify —
//   swap react-oidc-context for the vendor lib. All expose a similar
//   AuthProvider + useAuth() shape. Adjust src/auth/useAuth.ts accordingly.
//
// * Basic auth (legacy) — Replace LoginPage with a form that captures
//   username/password, POSTs to /api/login, and expects a cookie back.
//   Remove the OIDC provider from AuthProvider entirely.
//
// * Custom / internal IdP — Most internal IdPs speak OIDC these days. If
//   yours doesn't, implement your token exchange in src/auth/AuthProvider.tsx
//   and expose a compatible useAuth() interface so no downstream code
//   changes (permissions, ProtectedRoute, api/client.ts).
//
// KEY RULE: NEVER store tokens in localStorage or sessionStorage —
// XSS attackers will steal them. Use HttpOnly cookies set by your backend,
// or in-memory refs that die with the tab. react-oidc-context uses
// sessionStorage by default; for prod, configure userStore: WebStorageStateStore
// with a memory store, or better yet, have your backend own the session
// via cookies and remove the frontend token entirely.
// ============================================================================

import type { RuntimeConfig } from '@/config/runtime';

export interface OidcSettings {
  authority: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  response_type: 'code';
  post_logout_redirect_uri: string;
}

export function oidcSettingsFromConfig(cfg: RuntimeConfig): OidcSettings {
  return {
    authority: cfg.oidc.issuer,
    client_id: cfg.oidc.clientId,
    redirect_uri: cfg.oidc.redirectUri,
    scope: cfg.oidc.scopes,
    response_type: 'code',
    post_logout_redirect_uri: window.location.origin,
  };
}
