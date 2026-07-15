// Domain type — the shape of an "item" as returned by the (developer's own)
// backend. Kept generic on purpose: swap this for your actual domain type
// (User, Order, Ticket, whatever) when you delete the example.
//
// The MSW mock generates data matching this shape; the schema in
// ../schemas/item-schema.ts validates it at the boundary.

export interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}
