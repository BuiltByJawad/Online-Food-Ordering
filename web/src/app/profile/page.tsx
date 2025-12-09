'use client';

import { useProfileForm } from './hooks';

export default function ProfilePage() {
  const { profile, loading, form, handleSubmit } = useProfileForm();

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Profile
        </h1>
        {profile && (
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as <span className="font-medium">{profile.email}</span>
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone
            </label>
            <input
              type="tel"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Manage addresses in{' '}
          <a
            href="/profile/addresses"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Address Book
          </a>
        </p>

        <p className="mt-1 text-center text-sm text-zinc-600 dark:text-zinc-400">
          View your recent orders in{' '}
          <a
            href="/orders"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            My orders
          </a>
        </p>
      </div>
    </div>
  );
}
