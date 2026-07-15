// In-memory fake data for MSW.
//
// This exists ONLY so `pnpm dev` shows a working example CRUD flow without
// any backend running. Reset on every page refresh; that's fine — it's
// a demo, not a fixture.

import type { Item } from '@/features/example-items/types/item';

const nowIso = () => new Date().toISOString();
let idSeed = 1;

const seed: Item[] = [
  {
    id: 'seed-1',
    name: 'First example item',
    description: 'This is fake data served by MSW in dev mode. See src/mocks/.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'seed-2',
    name: 'Second example item',
    description: 'Replace src/features/example-items/ with your own domain feature.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const store = {
  items: [...seed] as Item[],
  create(input: Pick<Item, 'name' | 'description'>): Item {
    const item: Item = {
      id: `item-${idSeed++}`,
      name: input.name,
      description: input.description,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this.items.unshift(item);
    return item;
  },
  remove(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((it) => it.id !== id);
    return this.items.length < before;
  },
};
