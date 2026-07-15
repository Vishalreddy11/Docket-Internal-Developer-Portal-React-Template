// TanStack Query hooks — server-state layer for the items feature.
//
// Pattern: one hook per query, one hook per mutation. Callers get a
// declarative `data / isLoading / error` triplet without touching the
// underlying fetch.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QueryKeys } from '@/api/query-keys';
import { createItem, deleteItem, getItem, listItems } from '../api/items-api';
import type { ItemCreateInput } from '../schemas/item-schema';

export function useItemsList(limit = 20, offset = 0) {
  return useQuery({
    queryKey: QueryKeys.items.list(limit, offset),
    queryFn: () => listItems(limit, offset),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: QueryKeys.items.detail(id),
    queryFn: () => getItem(id),
    enabled: Boolean(id),
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemCreateInput) => createItem(input),
    onSuccess: () => {
      // Invalidate the list so it re-fetches.
      void qc.invalidateQueries({ queryKey: QueryKeys.items.all });
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QueryKeys.items.all });
    },
  });
}
