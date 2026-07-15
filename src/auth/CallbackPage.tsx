// OIDC callback page — the IdP redirects here with the auth code.
//
// react-oidc-context handles the code-exchange automatically; this page
// just shows a loading spinner while that happens, then routes to /.

import { useEffect } from 'react';
import { Navigate, useNavigate } from '@tanstack/react-router';

import { useAuth } from './useAuth';
import { Loading } from '@/shared/components/Loading';

export function CallbackPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: '/', replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Loading />;
}
