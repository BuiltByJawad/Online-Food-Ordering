'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormSelect } from '@/components/ui/form';
import { promoSchema, type PromoFormValues } from '@/lib/schemas/promotions';

type Props = {
  submitting: boolean;
  error: string | null;
  onSubmit: (values: PromoFormValues) => Promise<boolean>;
};

export function PromotionForm({ submitting, error, onSubmit }: Props) {
  const form = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema) as Resolver<PromoFormValues>,
    defaultValues: {
      code: '',
      discountType: 'percent',
      discountValue: 10,
      maxDiscount: undefined,
      maxUses: undefined,
      perUserLimit: undefined,
      validFrom: undefined,
      validTo: undefined,
      branchId: undefined,
      status: 'active',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) {
      form.reset();
    }
  });

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Create promo
      </h2>
      <form
        className="grid gap-3 text-sm text-zinc-800 dark:text-zinc-100"
        onSubmit={handleSubmit}
        noValidate
      >
        <FormInput
          label="Code"
          required
          placeholder="SUMMER10"
          {...form.register('code')}
          error={form.formState.errors.code}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            label="Type"
            required
            {...form.register('discountType')}
            error={form.formState.errors.discountType}
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
          </FormSelect>
          <FormInput
            label="Value"
            required
            type="number"
            min="0"
            step="0.01"
            {...form.register('discountValue', { valueAsNumber: true })}
            error={form.formState.errors.discountValue}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Max discount (optional)"
            type="number"
            min="0"
            step="0.01"
            {...form.register('maxDiscount', { valueAsNumber: true })}
            error={form.formState.errors.maxDiscount}
          />
          <FormInput
            label="Max uses (0 = unlimited)"
            type="number"
            min="0"
            {...form.register('maxUses', { valueAsNumber: true })}
            error={form.formState.errors.maxUses}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Per-user limit (0 = unlimited)"
            type="number"
            min="0"
            {...form.register('perUserLimit', { valueAsNumber: true })}
            error={form.formState.errors.perUserLimit}
          />
          <FormInput
            label="Branch ID (optional)"
            placeholder="UUID"
            {...form.register('branchId')}
            error={form.formState.errors.branchId}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Valid from"
            type="datetime-local"
            {...form.register('validFrom')}
            error={form.formState.errors.validFrom}
          />
          <FormInput
            label="Valid to"
            type="datetime-local"
            {...form.register('validTo')}
            error={form.formState.errors.validTo}
          />
        </div>
        <FormSelect
          label="Status"
          required
          {...form.register('status')}
          error={form.formState.errors.status}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FormSelect>
        <button
          type="submit"
          disabled={submitting || form.formState.isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting || form.formState.isSubmitting ? 'Creating...' : 'Create promo'}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </form>
    </div>
  );
}
