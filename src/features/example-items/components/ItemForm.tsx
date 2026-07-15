// Item creation form — demonstrates react-hook-form + Zod resolver.

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/auth/useAuth';
import { Permissions } from '@/auth/permissions';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { ItemCreateSchema, type ItemCreateInput } from '../schemas/item-schema';
import { useCreateItem } from '../hooks/use-items';

interface Props {
  onCreated?: () => void;
}

export function ItemForm({ onCreated }: Props) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission(Permissions.ItemsWrite);
  const create = useCreateItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemCreateInput>({
    resolver: zodResolver(ItemCreateSchema),
    defaultValues: { name: '', description: '' },
  });

  if (!canWrite) return null;

  return (
    <form
      onSubmit={handleSubmit((data) => {
        create.mutate(data, {
          onSuccess: () => {
            reset();
            onCreated?.();
          },
        });
      })}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} disabled={create.isPending} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} disabled={create.isPending} />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>
      {create.error && <ErrorMessage error={create.error} />}
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Creating…' : 'Create'}
      </Button>
    </form>
  );
}
