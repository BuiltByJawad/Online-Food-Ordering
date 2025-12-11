'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUsers } from '../hooks';
import { useAdminVendors } from './hooks';

export default function AdminVendorsPage() {
  const router = useRouter();
  const { loading: loadingUsers, users } = useAdminUsers();
  const {
    loading: loadingVendors,
    vendors,
    error,
    creating,
    reload,
    createVendor,
  } = useAdminVendors();

  const loading = loadingUsers || loadingVendors;
  const hasVendors = vendors.length > 0;

  const vendorManagers = useMemo(
    () => users.filter((user) => user.role === 'vendor_manager'),
    [users],
  );

  const [ownerUserId, setOwnerUserId] = useState('');
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [payoutCycle, setPayoutCycle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateVendor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ownerUserId || !name.trim()) {
      setFormError('Please select an owner and enter a vendor name.');
      return;
    }

    setFormError(null);

    const commission = commissionRate.trim().length
      ? Number(commissionRate)
      : undefined;

    await createVendor({
      ownerUserId,
      name: name.trim(),
      brandName: brandName.trim() || undefined,
      legalName: legalName.trim() || undefined,
      taxId: taxId.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      commissionRate: Number.isNaN(commission) ? undefined : commission,
      payoutCycle: payoutCycle.trim() || undefined,
    });

    setName('');
    setBrandName('');
    setLegalName('');
    setTaxId('');
    setContactEmail('');
    setContactPhone('');
    setCommissionRate('');
    setPayoutCycle('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
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

        <form
          className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
          onSubmit={handleCreateVendor}
          noValidate
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              New vendor
            </p>
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {creating ? 'Creating...' : 'Create vendor'}
            </button>
          </div>

          {formError && (
            <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Owner (vendor manager)</span>
                <span className="text-red-600">*</span>
              </label>
              <select
                value={ownerUserId}
                onChange={(event) => setOwnerUserId(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Select owner</option>
                {vendorManagers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                    {user.name ? `  ${user.name}` : ''}
                  </option>
                ))}
              </select>
              {vendorManagers.length === 0 && (
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  No vendor managers found. Use the Users admin page to promote a
                  user to vendor manager first.
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Vendor name</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Brand name (optional)
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Legal name (optional)
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(event) => setLegalName(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tax ID (optional)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(event) => setTaxId(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Contact email (optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Contact phone (optional)
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Commission rate (0–1, optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={commissionRate}
                onChange={(event) => setCommissionRate(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Payout cycle (optional)
              </label>
              <input
                type="text"
                value={payoutCycle}
                onChange={(event) => setPayoutCycle(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>
        </form>

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
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

        {!error && !hasVendors && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            No vendors have been created yet.
          </div>
        )}

        {!error && hasVendors && (
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
                      <div className="font-medium">
                        {vendor.brandName || vendor.name}
                      </div>
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
                      <div>{vendor.contactEmail || ''}</div>
                      <div>{vendor.contactPhone || ''}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                      <div>
                        {vendor.commissionRate != null
                          ? `${(vendor.commissionRate * 100).toFixed(1)}%`
                          : ''}
                      </div>
                      <div>{vendor.payoutCycle || ''}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
