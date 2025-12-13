'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormSelect } from '@/components/ui/form';
import type { User } from '@/types/api';
import { vendorSchema, type VendorFormValues } from '../schemas';

type Props = {
  vendorManagers: User[];
  creating: boolean;
  onSubmit: (values: VendorFormValues) => Promise<boolean>;
};

export function VendorForm({ vendorManagers, creating, onSubmit }: Props) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      ownerUserId: '',
      name: '',
      brandName: '',
      legalName: '',
      taxId: '',
      contactEmail: '',
      contactPhone: '',
      commissionRate: '',
      payoutCycle: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) {
      form.reset();
    }
  });

  return (
    <form
      className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          New vendor
        </p>
        <button
          type="submit"
          disabled={creating || form.formState.isSubmitting}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {creating || form.formState.isSubmitting ? 'Creating...' : 'Create vendor'}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <FormSelect
          label="Owner (vendor manager)"
          required
          {...form.register('ownerUserId')}
          error={form.formState.errors.ownerUserId}
        >
          <option value="">Select owner</option>
          {vendorManagers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
              {user.name ? ` — ${user.name}` : ''}
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Vendor name"
          required
          {...form.register('name')}
          error={form.formState.errors.name}
        />

        <FormInput
          label="Brand name (optional)"
          {...form.register('brandName')}
          error={form.formState.errors.brandName}
        />

        <FormInput
          label="Legal name (optional)"
          {...form.register('legalName')}
          error={form.formState.errors.legalName}
        />

        <FormInput
          label="Tax ID (optional)"
          {...form.register('taxId')}
          error={form.formState.errors.taxId}
        />

        <FormInput
          label="Contact email (optional)"
          type="email"
          {...form.register('contactEmail')}
          error={form.formState.errors.contactEmail}
        />

        <FormInput
          label="Contact phone (optional)"
          {...form.register('contactPhone')}
          error={form.formState.errors.contactPhone}
        />

        <FormInput
          label="Commission rate (0–1, optional)"
          type="number"
          step="0.01"
          min="0"
          max="1"
          {...form.register('commissionRate')}
          error={form.formState.errors.commissionRate}
        />

        <FormInput
          label="Payout cycle (optional)"
          {...form.register('payoutCycle')}
          error={form.formState.errors.payoutCycle}
        />
      </div>
    </form>
  );
}
