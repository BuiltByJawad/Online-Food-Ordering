'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormInput, FormTextarea } from '@/components/ui/form';
import type { ReviewFormValues } from '../schemas';

type Props = {
  open: boolean;
  orderId: string | null;
  submitting: boolean;
  form: UseFormReturn<ReviewFormValues>;
  onClose: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export function ReviewModal({ open, orderId, submitting, form, onClose, onSubmit }: Props) {
  if (!open || !orderId) return null;

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Rate your order</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Order ID: {orderId}</p>
        <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
          <FormInput
            type="number"
            label="Rating"
            required
            min={1}
            max={5}
            step={1}
            {...register('rating', { valueAsNumber: true })}
            error={errors.rating}
          />
          <FormTextarea
            label="Feedback (optional)"
            rows={4}
            maxLength={1000}
            placeholder="What went well? What could improve?"
            {...register('comment')}
            error={errors.comment}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isSubmitting}
              className="rounded-md bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {submitting || isSubmitting ? 'Submitting...' : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
