'use client';

import { FormInput } from '@/components/ui/form';
import { useLoginForm } from '../hooks/useAuthForms';

export function LoginForm() {
  const { form, handleSubmit } = useLoginForm();
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
        autoComplete="current-password"
        {...register('password')}
        error={errors.password}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
