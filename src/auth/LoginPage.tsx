// Login page — triggers the OIDC redirect flow.
//
// For mock/none modes, the router shouldn't route here (users are already
// "authenticated"). This page is a fallback for when someone navigates
// manually.

import { Navigate } from '@tanstack/react-router';

import { useAuth } from './useAuth';
import { Button } from '@/ui/button';

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          You'll be redirected to your identity provider.
        </p>
        <Button onClick={signIn} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}
