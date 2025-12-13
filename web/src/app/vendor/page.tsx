'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BranchForm } from './components/BranchForm';
import type { Branch } from '@/types/api';
import type { BranchFormValues } from './schemas';
import { useVendorDashboard } from './hooks';

export default function VendorDashboardPage() {
  const router = useRouter();
  const {
    loading,
    vendor,
    branches,
    createBranch,
    updateBranch,
    deleteBranch,
  } = useVendorDashboard();
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const handleCreateBranch = async (values: BranchFormValues) => {
    await createBranch(values);
  };

  const handleEditBranch = async (values: BranchFormValues) => {
    if (!editingBranch) return;
    const ok = await updateBranch(editingBranch.id, values);
    if (ok) setEditingBranch(null);
  };

  const handleDeleteBranch = async (branchId: string) => {
    const ok = await deleteBranch(branchId);
    if (ok && editingBranch && editingBranch.id === branchId) {
      setEditingBranch(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 md:col-span-2" />
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 md:col-span-2" />
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Vendor Portal
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No vendor account is associated with your user yet. Please contact
            the platform administrator for onboarding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Vendor Portal
        </h1>

        <section className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Vendor
          </h2>
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {vendor.brandName || vendor.name}
          </p>
          {vendor.legalName && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Legal name: {vendor.legalName}
            </p>
          )}
          <p className="mt-2 inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            Status: {vendor.status}
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Branches
            </h2>
          </div>

          <BranchForm
            title="Create branch"
            submitLabel="Add branch"
            resetOnSuccess
            onSubmit={handleCreateBranch}
          />

          {branches.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No branches have been created for this vendor yet. Please contact
              the platform administrator.
            </p>
          )}

          {branches.map((branch) => (
            <div
              key={branch.id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {branch.name}
                  </p>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {branch.status}
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {branch.addressLine1}
                  {branch.addressLine2 ? `, ${branch.addressLine2}` : ''}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {branch.city}
                  {branch.postalCode ? `, ${branch.postalCode}` : ''}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {branch.country}
                </p>
                {editingBranch && editingBranch.id === branch.id ? (
                  <BranchForm
                    title="Edit branch"
                    submitLabel="Save changes"
                    defaultValues={{
                      name: branch.name,
                      addressLine1: branch.addressLine1,
                      addressLine2: branch.addressLine2 ?? '',
                      city: branch.city,
                      postalCode: branch.postalCode ?? '',
                      country: branch.country,
                      lat: branch.lat != null ? String(branch.lat) : '',
                      lng: branch.lng != null ? String(branch.lng) : '',
                      status: branch.status as BranchFormValues['status'],
                    }}
                    onSubmit={handleEditBranch}
                    onCancel={() => setEditingBranch(null)}
                  />
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBranch(branch)}
                      className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/vendor/branches/${branch.id}/menu`)}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Manage menu
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/vendor/branches/${branch.id}/orders`)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  View orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBranch(branch);
                  }}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to delete this branch? This cannot be undone.',
                      )
                    ) {
                      void handleDeleteBranch(branch.id);
                    }
                  }}
                  className="rounded-md border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
