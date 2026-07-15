// AppShell — the layout wrapper around every page.
//
// Owns: top nav bar with user info + logout, page container, unauthorized
// listener (redirects to /login when the API client emits the event).

import { type ReactNode, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';

import { onUnauthorized } from '@/api/client';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/ui/button';

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  // Any 401 from the API client redirects the user to /login. This is the
  // canonical "session expired" recovery path.
  useEffect(() => {
    return onUnauthorized(() => {
      void navigate({ to: '/login', replace: true });
    });
  }, [navigate]);

  // TODO(ux): Enterprise internal tools almost always expect a left
  // sidebar with feature nav (Items, Users, Settings, etc.). This shell
  // ships top-nav only — deliberately minimal so teams pick their layout.
  // When you add a sidebar, one common shape:
  //
  //   <div className="min-h-screen grid grid-cols-[240px_1fr]">
  //     <Sidebar />          {/* list of feature links, collapsible */}
  //     <div>
  //       <header>{ /* top bar */ }</header>
  //       <main>{children}</main>
  //     </div>
  //   </div>
  //
  // Each feature under src/features/ should export its nav entry (icon,
  // label, path, required permission) and the Sidebar composes them.
  return (
    <div className="min-h-screen">
      <header className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            Docket
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email || 'Signed in'}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
