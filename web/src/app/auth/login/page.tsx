'use client';

import { useLoginForm } from '../hooks';

export default function LoginPage() {
  const { form, handleSubmit } = useLoginForm();

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span>Email</span>
              <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span>Password</span>
              <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <a
            href="/auth/register"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
