'use client';

import type { AdminVendor } from '../types/vendor';

type Props = {
  vendors: AdminVendor[];
  error: string | null;
  hasVendors: boolean;
};

export function VendorTable({ vendors, error, hasVendors }: Props) {
  if (error) {
    return null;
  }

  if (!hasVendors) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
        No vendors have been created yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Vendor
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Owner
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Contact
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Terms
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-900 dark:text-zinc-50">
                <div className="font-medium">{vendor.brandName || vendor.name}</div>
                {vendor.legalName && (
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {vendor.legalName}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                <div>{vendor.owner?.email}</div>
                {vendor.owner?.name && (
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {vendor.owner.name}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                {vendor.status}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                <div>{vendor.contactEmail || '—'}</div>
                <div>{vendor.contactPhone || '—'}</div>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                <div>
                  {vendor.commissionRate != null
                    ? `${(Number(vendor.commissionRate) * 100).toFixed(1)}%`
                    : '—'}
                </div>
                <div>{vendor.payoutCycle || '—'}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
