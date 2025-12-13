'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormSelect } from '@/components/ui/form';
import { optionSchema, type OptionFormValues } from '../schemas';

type Props = {
  items: Array<{ id: string; name: string; categoryName?: string }>;
  onSubmit: (values: OptionFormValues) => Promise<void>;
  submitting?: boolean;
};

export function OptionForm({ items, onSubmit, submitting = false }: Props) {
  const form = useForm<OptionFormValues>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      itemId: '',
      type: '',
      name: '',
      priceDelta: '',
      isRequired: false,
      maxSelection: '',
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
      itemId: values.itemId,
      type: '',
      name: '',
      priceDelta: '',
      isRequired: false,
      maxSelection: '',
    });
  });

  return (
    <form
      className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      onSubmit={submit}
      noValidate
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Add option
      </h2>

      <FormSelect
        label="Item"
        required
        {...register('itemId')}
        error={errors.itemId}
      >
        <option value="">Select an item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.categoryName ? `${item.categoryName} — ` : ''}
            {item.name}
          </option>
        ))}
      </FormSelect>

      <FormInput
        label="Type"
        required
        placeholder="e.g., size, add-on"
        {...register('type')}
        error={errors.type}
      />

      <FormInput
        label="Name"
        required
        {...register('name')}
        error={errors.name}
      />

      <FormInput
        label="Price delta"
        placeholder="0"
        inputMode="decimal"
        {...register('priceDelta')}
        error={errors.priceDelta}
      />

      <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          {...register('isRequired')}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span>Required</span>
      </label>

      <FormInput
        label="Max selection"
        placeholder="Optional"
        inputMode="numeric"
        {...register('maxSelection')}
        error={errors.maxSelection}
      />

      <button
        type="submit"
        disabled={submitting || isSubmitting}
        className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {submitting || isSubmitting ? 'Adding...' : 'Add option'}
      </button>
    </form>
  );
}
