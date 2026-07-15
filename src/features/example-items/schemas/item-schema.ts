// Runtime validation at the API boundary — Zod schemas match the domain
// types in ../types/item.ts.
//
// Why validate: the backend contract can change. Without runtime checks,
// a missing field is a `undefined.length` crash somewhere three components
// deep. With Zod, it's a caught error at the API layer, surfaced through
// the standard <ErrorMessage>.

import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ItemListSchema = z.object({
  items: z.array(ItemSchema),
  total: z.number(),
});

// Input schemas — enforced by react-hook-form + zodResolver in the form.
export const ItemCreateSchema = z.object({
  name: z.string().min(1, 'Required').max(100),
  description: z.string().max(500).default(''),
});
export type ItemCreateInput = z.infer<typeof ItemCreateSchema>;
