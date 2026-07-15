// Feature-scoped API client for /items.
//
// The endpoints below are what the MSW mock intercepts in dev. When you
// wire your real backend:
//   1. Delete src/mocks/ (or leave it; it only runs when import.meta.env.DEV).
//   2. Set VITE_API_BASE_URL / runtime-config.apiBaseUrl to your backend.
//   3. Adjust the paths and shapes below to match your API.

import { getApiClient } from '@/api/client';
import { ItemListSchema, ItemSchema, type ItemCreateInput } from '../schemas/item-schema';
import type { Item } from '../types/item';

export async function listItems(limit = 20, offset = 0): Promise<{ items: Item[]; total: number }> {
  const res = await getApiClient().get('/items', { params: { limit, offset } });
  return ItemListSchema.parse(res.data);
}

export async function getItem(id: string): Promise<Item> {
  const res = await getApiClient().get(`/items/${id}`);
  return ItemSchema.parse(res.data);
}

export async function createItem(input: ItemCreateInput): Promise<Item> {
  const res = await getApiClient().post('/items', input);
  return ItemSchema.parse(res.data);
}

export async function deleteItem(id: string): Promise<void> {
  await getApiClient().delete(`/items/${id}`);
}
