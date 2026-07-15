// Items table — demonstrates TanStack Query data flow + permission-gated
// delete button.

import { Link } from '@tanstack/react-router';

import { useAuth } from '@/auth/useAuth';
import { Permissions } from '@/auth/permissions';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Loading } from '@/shared/components/Loading';
import { Button } from '@/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { useDeleteItem, useItemsList } from '../hooks/use-items';

export function ItemList() {
  const { data, isLoading, error } = useItemsList(20, 0);
  const del = useDeleteItem();
  const { hasPermission } = useAuth();
  const canDelete = hasPermission(Permissions.ItemsDelete);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  if (!data || data.items.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No items yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.items.map((it) => (
          <TableRow key={it.id}>
            <TableCell className="font-medium">
              <Link to="/items/$id" params={{ id: it.id }} className="hover:underline">
                {it.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{it.description}</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(it.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => del.mutate(it.id)}
                  disabled={del.isPending}
                >
                  Delete
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
