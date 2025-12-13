'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormSelect } from '@/components/ui/form';
import { itemSchema, type ItemFormValues } from '../schemas';

type Props = {
  categories: Array<{ id: string; name: string }>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  submitting?: boolean;
};

export function ItemForm({ categories, onSubmit, submitting = false }: Props) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      imageUrl: '',
      basePrice: '',
      taxCategory: '',
      isAvailable: true,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset({
      categoryId: values.categoryId,
      name: '',
      description: '',
      imageUrl: '',
      basePrice: '',
      taxCategory: '',
      isAvailable: true,
    });
  });

  return (
    <form
      className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      onSubmit={submit}
      noValidate
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Add item
      </h2>

      <FormSelect
        label="Category"
        required
        {...register('categoryId')}
        error={errors.categoryId}
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </FormSelect>

      <FormInput
        label="Name"
        required
        {...register('name')}
        error={errors.name}
      />
      <FormInput
        label="Description"
        placeholder="Optional"
        {...register('description')}
        error={errors.description}
      />
      <FormInput
        label="Image URL"
        placeholder="https://..."
        {...register('imageUrl')}
        error={errors.imageUrl}
      />
      <FormInput
        label="Base price"
        required
        type="text"
        inputMode="decimal"
        {...register('basePrice')}
        error={errors.basePrice}
      />
      <FormInput
        label="Tax category"
        placeholder="Optional"
        {...register('taxCategory')}
        error={errors.taxCategory}
      />

      <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          {...register('isAvailable')}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span>Available</span>
      </label>

      <button
        type="submit"
        disabled={submitting || isSubmitting}
        className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {submitting || isSubmitting ? 'Adding...' : 'Add item'}
      </button>
    </form>
  );
}
