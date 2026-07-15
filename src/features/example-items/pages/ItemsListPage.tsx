// Items list page — combines the list + the create form.
//
// This is the "showcase" page: shows auth, permissions, TanStack Query,
// react-hook-form + Zod, error surface, and design system components all
// in ~40 lines.

import { ItemForm } from '../components/ItemForm';
import { ItemList } from '../components/ItemList';

export function ItemsListPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Items</h1>
        <p className="text-sm text-muted-foreground">
          Replace this feature with your own domain. See <code>src/features/example-items/</code>.
        </p>
      </header>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-medium">Create item</h2>
        <ItemForm />
      </section>

      <section>
        <ItemList />
      </section>
    </div>
  );
}
