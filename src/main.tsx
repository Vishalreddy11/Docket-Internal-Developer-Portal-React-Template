// Composition Root — the ONLY place the app boots.
//
// Order matters:
//   1. Runtime config loaded FIRST (auth mode + API URL depend on it).
//   2. MSW mocks conditionally initialized (dev only, gated on env).
//   3. Providers assembled top-down: QueryClient -> Router -> Auth -> App.
//   4. React root renders.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { loadRuntimeConfig } from './config/runtime';
import './styles/globals.css';

async function bootstrap() {
  const cfg = await loadRuntimeConfig();

  // MSW is dev-only. In a production build, VITE-injected import.meta.env.DEV
  // is `false`; Vite tree-shakes this entire branch out of the bundle.
  if (import.meta.env.DEV && cfg.authMode === 'mock') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  }

  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('#root not found');

  createRoot(rootEl).render(
    <StrictMode>
      <App config={cfg} />
    </StrictMode>,
  );
}

void bootstrap();
