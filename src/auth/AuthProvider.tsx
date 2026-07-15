// AuthProvider — routes to OIDC / mock / none based on runtime config.
//
// This is a thin dispatcher: it picks the right underlying provider and
// exposes a uniform useAuth() hook via context. Feature code never imports
// react-oidc-context directly — it only sees useAuth().

import { createContext, useContext, type ReactNode } from 'react';
import { AuthProvider as OidcProvider, useAuth as useOidcAuth } from 'react-oidc-context';

import type { RuntimeConfig } from '@/config/runtime';
import { oidcSettingsFromConfig } from './auth-config';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  permissions: readonly string[];
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  hasPermission: (perm: string) => boolean;
}

const Ctx = createContext<AuthState | null>(null);

interface Props {
  config: RuntimeConfig;
  children: ReactNode;
}

export function AuthProvider({ config, children }: Props) {
  if (config.authMode === 'oidc') {
    return (
      <OidcProvider {...oidcSettingsFromConfig(config)}>
        <OidcBridge>{children}</OidcBridge>
      </OidcProvider>
    );
  }
  if (config.authMode === 'mock') {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <NoAuthProvider>{children}</NoAuthProvider>;
}

/** Bridges react-oidc-context's shape into our AuthState. */
function OidcBridge({ children }: { children: ReactNode }) {
  const oidc = useOidcAuth();

  const claims = oidc.user?.profile ?? null;
  const user: AuthUser | null = claims
    ? {
        id: String(claims.sub ?? ''),
        name: String(claims.name ?? claims.preferred_username ?? ''),
        email: String(claims.email ?? ''),
        // Permission claims vary by IdP. Adjust for yours.
        permissions: Array.isArray(claims['permissions'])
          ? (claims['permissions'] as string[])
          : [],
      }
    : null;

  const value: AuthState = {
    user,
    isLoading: oidc.isLoading,
    isAuthenticated: oidc.isAuthenticated,
    signIn: () => void oidc.signinRedirect(),
    signOut: () => void oidc.signoutRedirect(),
    hasPermission: (perm) => user?.permissions.includes(perm) ?? false,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Local-dev mode: skip login, inject a fake user. */
function MockAuthProvider({ children }: { children: ReactNode }) {
  const value: AuthState = {
    user: {
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      // Adjust for the demo experience you want; see permissions.ts for the
      // canonical list of permission strings the template's routes check.
      permissions: ['items:read', 'items:write', 'items:delete'],
    },
    isLoading: false,
    isAuthenticated: true,
    signIn: () => {
      /* no-op — already signed in */
    },
    signOut: () => {
      /* no-op — mock user can't log out */
    },
    hasPermission: (perm) =>
      ['items:read', 'items:write', 'items:delete'].includes(perm),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Public app: no user, no permissions, everyone can see everything. */
function NoAuthProvider({ children }: { children: ReactNode }) {
  const value: AuthState = {
    user: null,
    isLoading: false,
    isAuthenticated: true,
    signIn: () => {},
    signOut: () => {},
    hasPermission: () => true,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth called outside AuthProvider');
  return v;
}
