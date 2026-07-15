import { Link, useParams } from '@tanstack/react-router';

import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Loading } from '@/shared/components/Loading';
import { Button } from '@/ui/button';
import { useItem } from '../hooks/use-items';

export function ItemDetailPage() {
  const { id } = useParams({ from: '/items/$id' });
  const { data, isLoading, error } = useItem(id);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/items">
          <Button variant="link" className="px-0">
            ← Back to items
          </Button>
        </Link>
      </div>
      <div className="rounded-lg border p-6">
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{data.description || 'No description.'}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-mono">{data.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{new Date(data.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
