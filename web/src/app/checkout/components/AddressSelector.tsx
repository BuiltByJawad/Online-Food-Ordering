'use client';

import type { Address } from '@/types/api';

type Props = {
  addresses: Address[];
  loading: boolean;
  authRequired: boolean;
  error: string | null;
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
  onManage: () => void;
  onSignIn: () => void;
};

export function AddressSelector({
  addresses,
  loading,
  authRequired,
  error,
  selectedAddressId,
  onSelect,
  onManage,
  onSignIn,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-medium">Sign in to choose a saved delivery address.</p>
        <button
          type="button"
          onClick={onSignIn}
          className="rounded-md bg-amber-900 px-3 py-1.5 text-[11px] font-medium text-amber-50 hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-900 dark:hover:bg-amber-100"
        >
          Go to login
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  if (addresses.length === 0) {
    return (
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        You have no saved addresses yet. Use the Address Book to add one.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {addresses.map((address) => (
        <label
          key={address.id}
          className={`flex cursor-pointer items-start justify-between gap-2 rounded-md border px-3 py-2 text-xs ${
            selectedAddressId === address.id
              ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900'
              : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-500'
          }`}
        >
          <div className="flex items-start gap-2">
            <input
              type="radio"
              name="deliveryAddress"
              value={address.id}
              checked={selectedAddressId === address.id}
              onChange={() => onSelect(address.id)}
              className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900"
            />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {address.label}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {address.city}
                {address.postalCode ? ` ${address.postalCode}` : ''}
                {address.country ? `, ${address.country}` : ''}
              </p>
            </div>
          </div>
          {address.isDefault && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
              Default
            </span>
          )}
        </label>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onManage}
          className="text-xs text-zinc-600 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Manage addresses
        </button>
      </div>
    </div>
  );
}
