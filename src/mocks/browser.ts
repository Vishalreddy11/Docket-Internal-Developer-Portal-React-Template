// MSW browser worker setup.
//
// Only imported in dev (src/main.tsx gates on import.meta.env.DEV). The
// service worker script itself (/mockServiceWorker.js) is generated once
// via `pnpm exec msw init public/ --save`. Committed to public/ so
// developers don't need to run that after cloning.

import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
