// MSW request handlers — one per endpoint the example feature calls.
//
// When you wire your real backend:
//   - Remove `worker.start()` from src/main.tsx (or set VITE_AUTH_MODE
//     to `oidc` so the branch isn't entered).
//   - Delete this directory. The production build already tree-shakes it
//     via import.meta.env.DEV.

import { HttpResponse, http } from 'msw';

import { store } from './data';

export const handlers = [
  http.get('*/items', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);
    const slice = store.items.slice(offset, offset + limit);
    return HttpResponse.json({ items: slice, total: store.items.length });
  }),

  http.get('*/items/:id', ({ params }) => {
    const item = store.items.find((it) => it.id === params.id);
    if (!item) {
      return HttpResponse.json(
        { code: 'ITEM_NOT_FOUND', message: 'Item not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json(item);
  }),

  http.post('*/items', async ({ request }) => {
    const body = (await request.json()) as { name?: string; description?: string };
    if (!body.name) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'name is required' },
        { status: 400 },
      );
    }
    const item = store.create({ name: body.name, description: body.description ?? '' });
    return HttpResponse.json(item, { status: 201 });
  }),

  http.delete('*/items/:id', ({ params }) => {
    const removed = store.remove(String(params.id));
    if (!removed) {
      return HttpResponse.json(
        { code: 'ITEM_NOT_FOUND', message: 'Item not found' },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
