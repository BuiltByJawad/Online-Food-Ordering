'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/ui/form';
import { promoSchema, type PromoFormValues } from '../schemas';

type Props = {
  disabled: boolean;
  applying: boolean;
  appliedPromoCode: string | null;
  error: string | null;
  onApply: (values: PromoFormValues) => Promise<void> | void;
};

export function PromoForm({
  disabled,
  applying,
  appliedPromoCode,
  error,
  onApply,
}: Props) {
  const form = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      code: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const submit = handleSubmit(async (values) => {
    await onApply(values);
    reset({ code: values.code.trim().toUpperCase() });
  });

  return (
    <div className="space-y-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Apply promo code
        </span>
        {appliedPromoCode && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
            {appliedPromoCode}
          </span>
        )}
      </div>
      <form className="flex gap-2" onSubmit={submit} noValidate>
        <div className="flex-1">
          <FormInput
            label="Promo code"
            required
            placeholder="SUMMER10"
            autoComplete="off"
            {...register('code')}
            error={errors.code}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || applying}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {applying ? 'Applying...' : appliedPromoCode ? 'Reapply' : 'Apply'}
        </button>
      </form>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
