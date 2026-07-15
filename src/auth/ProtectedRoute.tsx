// ProtectedRoute — the canonical auth+authz wrapper for protected routes.
//
// Two responsibilities:
//   1. Redirect to /login if the user isn't authenticated.
//   2. Show ForbiddenPage if a `permission` is required and the user
//      doesn't have it.
//
// Kept intentionally thin — auth logic lives in useAuth(); this is
// just the render gate.

import { type ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';

import { useAuth } from './useAuth';
import { Loading } from '@/shared/components/Loading';

interface Props {
  children: ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: Props) {
  const { isLoading, isAuthenticated, hasPermission } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
