'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/ui/form';
import { categorySchema, type CategoryFormValues } from '../schemas';

type Props = {
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  submitting?: boolean;
};

export function CategoryForm({ onSubmit, submitting = false }: Props) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', sortOrder: '' },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset({ name: '', sortOrder: '' });
  });

  return (
    <form
      className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      onSubmit={submit}
      noValidate
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Add category
      </h2>

      <FormInput
        label="Name"
        required
        {...register('name')}
        error={errors.name}
      />
      <FormInput
        label="Sort order"
        placeholder="Optional"
        {...register('sortOrder')}
        error={errors.sortOrder}
      />

      <button
        type="submit"
        disabled={submitting || isSubmitting}
        className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {submitting || isSubmitting ? 'Adding...' : 'Add category'}
      </button>
    </form>
  );
}
