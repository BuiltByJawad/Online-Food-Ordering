'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormSelect } from '@/components/ui/form';
import { branchSchema, type BranchFormValues } from '../schemas';

type Props = {
  title: string;
  submitting?: boolean;
  defaultValues?: Partial<BranchFormValues>;
  onSubmit: (values: BranchFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  resetOnSuccess?: boolean;
};

export function BranchForm({
  title,
  submitting = false,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  resetOnSuccess = false,
}: Props) {
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: '',
      lat: '',
      lng: '',
      status: 'active',
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    if (resetOnSuccess) {
      reset({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
        lat: '',
        lng: '',
        status: 'active',
        ...defaultValues,
      });
    }
  });

  return (
    <form
      className="grid grid-cols-1 gap-3 rounded-lg border border-dashed border-zinc-300 p-4 text-sm dark:border-zinc-700 md:grid-cols-2"
      onSubmit={handleFormSubmit}
      noValidate
    >
      <div className="md:col-span-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          {title}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>

      <FormInput
        label="Name"
        required
        {...register('name')}
        error={errors.name}
      />
      <FormInput
        label="City"
        required
        {...register('city')}
        error={errors.city}
      />
      <FormInput
        className="md:col-span-2"
        label="Address line 1"
        required
        {...register('addressLine1')}
        error={errors.addressLine1}
      />
      <FormInput
        className="md:col-span-2"
        label="Address line 2 (optional)"
        {...register('addressLine2')}
        error={errors.addressLine2}
      />
      <FormInput
        label="Postal code (optional)"
        {...register('postalCode')}
        error={errors.postalCode}
      />
      <FormInput
        label="Country"
        required
        {...register('country')}
        error={errors.country}
      />
      <FormInput
        label="Latitude (optional)"
        {...register('lat')}
        error={errors.lat}
      />
      <FormInput
        label="Longitude (optional)"
        {...register('lng')}
        error={errors.lng}
      />
      <FormSelect
        label="Status"
        required
        {...register('status')}
        error={errors.status}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="closed">Closed</option>
      </FormSelect>

      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting || isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting || isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
