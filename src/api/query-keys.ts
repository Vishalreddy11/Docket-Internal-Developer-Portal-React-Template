// Central query key registry.
//
// Every feature registers its keys here so `queryClient.invalidateQueries`
// stays type-safe and consistent. Prevents typos like 'item' vs 'items'
// breaking cache invalidation silently.

export const QueryKeys = {
  items: {
    all: ['items'] as const,
    list: (limit: number, offset: number) => ['items', 'list', { limit, offset }] as const,
    detail: (id: string) => ['items', 'detail', id] as const,
  },
} as const;
