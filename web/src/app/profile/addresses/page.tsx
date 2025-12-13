'use client';

import { AddressForm } from './components/AddressForm';
import { AddressList } from './components/AddressList';
import { useAddresses } from './hooks/useAddresses';

export default function AddressesPage() {
  const { addresses, loading, submitAddress, deleteAddress, makeDefault } = useAddresses();

  if (loading) {
    return (
      <div className="flex min-h-screen items-start justify_center bg-zinc-50 px-4 py-8 dark:bg-black">
        <div className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-9 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 md:col-span-2" />
          </div>
          <div className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Address Book
        </h1>

        <AddressForm submitting={false} onSubmit={submitAddress} />

        <AddressList
          addresses={addresses}
          onMakeDefault={makeDefault}
          onDelete={deleteAddress}
        />
      </div>
    </div>
  );
}
