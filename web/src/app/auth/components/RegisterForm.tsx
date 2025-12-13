'use client';

import { FormInput } from '@/components/ui/form';
import { useRegisterForm } from '../hooks/useAuthForms';

export function RegisterForm() {
  const { form, handleSubmit } = useRegisterForm();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <FormInput
        label="Email"
        required
        type="email"
        autoComplete="email"
        {...register('email')}
        error={errors.email}
      />

      <FormInput
        label="Password"
        required
        type="password"
        autoComplete="new-password"
        {...register('password')}
        error={errors.password}
      />

      <FormInput
        label="Name (optional)"
        {...register('name')}
        error={errors.name}
      />

      <FormInput
        label="Phone (optional)"
        type="tel"
        {...register('phone')}
        error={errors.phone}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  );
}
