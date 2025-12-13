'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/ui/form';
import { addressSchema, type AddressFormValues } from '../schemas';

type Props = {
  submitting: boolean;
  onSubmit: (values: AddressFormValues) => Promise<void>;
};

export function AddressForm({ submitting, onSubmit }: Props) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: '',
      lat: '',
      lng: '',
      isDefault: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset({
      label: '',
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: '',
      lat: '',
      lng: '',
      isDefault: false,
    });
  });

  return (
    <form className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
      <FormInput
        label="Label"
        required
        {...form.register('label')}
        error={form.formState.errors.label}
      />
      <FormInput
        label="City"
        required
        {...form.register('city')}
        error={form.formState.errors.city}
      />
      <FormInput
        label="Address line 1"
        required
        className="md:col-span-2"
        {...form.register('line1')}
        error={form.formState.errors.line1}
      />
      <FormInput
        label="Address line 2 (optional)"
        className="md:col-span-2"
        {...form.register('line2')}
        error={form.formState.errors.line2}
      />
      <FormInput
        label="Postal code (optional)"
        {...form.register('postalCode')}
        error={form.formState.errors.postalCode}
      />
      <FormInput
        label="Country"
        required
        {...form.register('country')}
        error={form.formState.errors.country}
      />
      <FormInput
        label="Latitude (optional)"
        {...form.register('lat')}
        error={form.formState.errors.lat}
      />
      <FormInput
        label="Longitude (optional)"
        {...form.register('lng')}
        error={form.formState.errors.lng}
      />
      <div className="md:col-span-2 flex items-center gap-2">
        <input
          id="isDefault"
          type="checkbox"
          {...form.register('isDefault')}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <label htmlFor="isDefault" className="text-sm text-zinc-700 dark:text-zinc-300">
          Set as default address
        </label>
      </div>
      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting || form.formState.isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting || form.formState.isSubmitting ? 'Adding address...' : 'Add address'}
        </button>
      </div>
    </form>
  );
}
