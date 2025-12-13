'use client';

import { useRouter } from 'next/navigation';
import { useAdminUsers } from '../hooks';
import { VendorForm } from './components/VendorForm';
import { VendorTable } from './components/VendorTable';
import { useVendors } from './hooks/useVendors';

export default function AdminVendorsPage() {
  const router = useRouter();
  const { loading: loadingUsers, users } = useAdminUsers();
  const { vendors, vendorManagers, loading, creating, error, reload, createVendor } =
    useVendors(users);

  const isLoading = loadingUsers || loading;
  const hasVendors = vendors.length > 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Admin  Vendors
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Create vendors and assign owner users (vendor managers).
              </p>
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 md:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Admin  Vendors
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Create vendors and assign owner users (vendor managers).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reload()}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Back home
            </button>
          </div>
        </div>

        <VendorForm
          vendorManagers={vendorManagers}
          creating={creating}
          onSubmit={createVendor}
        />

        {error && (
          <div className="flex items-center justify_between rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => reload()}
              className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium hover:bg-red-100 dark:border-red-500 dark:hover:bg-red-900"
            >
              Retry
            </button>
          </div>
        )}

        <VendorTable vendors={vendors} error={error} hasVendors={hasVendors} />
      </div>
    </div>
  );
}
