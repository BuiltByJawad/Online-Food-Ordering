'use client';

import type { Address } from '@/types/api';

type Props = {
  addresses: Address[];
  onMakeDefault: (id: string) => void;
  onDelete: (id: string) => void;
};

export function AddressList({ addresses, onMakeDefault, onDelete }: Props) {
  if (addresses.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No addresses yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="flex flex-col justify-between gap-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {address.label}
              </p>
              {address.isDefault && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                  Default
                </span>
              )}
            </div>
            <p className="text-zinc-700 dark:text-zinc-300">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">
              {address.city}
              {address.postalCode ? `, ${address.postalCode}` : ''}
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">
              {address.country}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!address.isDefault && (
              <button
                type="button"
                onClick={() => onMakeDefault(address.id)}
                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Make default
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(address.id)}
              className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
