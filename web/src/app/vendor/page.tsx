'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branchSchema, type BranchFormValues } from './schemas';
import { useVendorDashboard } from './hooks';
import type { Branch } from '@/types/api';

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

  const {
    register: registerBranch,
    handleSubmit: handleSubmitBranch,
    reset: resetBranch,
    formState: {
      errors: branchErrors,
      isSubmitting: isSubmittingBranch,
    },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: '',
      lat: '',
      lng: '',
      status: 'active',
    },
  });

  const {
    register: registerEditBranch,
    handleSubmit: handleSubmitEditBranch,
    reset: resetEditBranch,
    formState: {
      errors: editBranchErrors,
      isSubmitting: isSubmittingEditBranch,
    },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: '',
      lat: '',
      lng: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (!editingBranch) {
      return;
    }

    resetEditBranch({
      name: editingBranch.name,
      addressLine1: editingBranch.addressLine1,
      addressLine2: editingBranch.addressLine2 ?? '',
      city: editingBranch.city,
      postalCode: editingBranch.postalCode ?? '',
      country: editingBranch.country,
      lat: editingBranch.lat != null ? String(editingBranch.lat) : '',
      lng: editingBranch.lng != null ? String(editingBranch.lng) : '',
      status: editingBranch.status as BranchFormValues['status'],
    });
  }, [editingBranch, resetEditBranch]);

  const handleCreateBranch = async (values: BranchFormValues) => {
    const ok = await createBranch(values);
    if (ok) {
      resetBranch({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
        lat: '',
        lng: '',
        status: 'active' as BranchFormValues['status'],
      });
    }
  };

  const handleEditBranch = async (values: BranchFormValues) => {
    if (!editingBranch) {
      return;
    }

    const ok = await updateBranch(editingBranch.id, values);
    if (ok) {
      setEditingBranch(null);
    }
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

          <form
            className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-dashed border-zinc-300 p-4 text-sm dark:border-zinc-700 md:grid-cols-2"
            onSubmit={handleSubmitBranch(handleCreateBranch)}
            noValidate
          >
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Name</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('name')}
              />
              {branchErrors.name && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>City</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('city')}
              />
              {branchErrors.city && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.city.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Address line 1</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('addressLine1')}
              />
              {branchErrors.addressLine1 && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.addressLine1.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Address line 2 (optional)
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('addressLine2')}
              />
              {branchErrors.addressLine2 && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.addressLine2.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Postal code (optional)
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('postalCode')}
              />
              {branchErrors.postalCode && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.postalCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Country</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('country')}
              />
              {branchErrors.country && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.country.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Latitude (optional)
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('lat')}
              />
              {branchErrors.lat && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.lat.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Longitude (optional)
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerBranch('lng')}
              />
              {branchErrors.lng && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {branchErrors.lng.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingBranch}
                className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isSubmittingBranch ? 'Adding branch...' : 'Add branch'}
              </button>
            </div>
          </form>

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
                {editingBranch && editingBranch.id === branch.id && (
                  <form
                    className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-dashed border-zinc-300 p-3 text-xs dark:border-zinc-700 md:grid-cols-2"
                    onSubmit={handleSubmitEditBranch(handleEditBranch)}
                    noValidate
                  >
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        <span>Name</span>
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('name')}
                      />
                      {editBranchErrors.name && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        <span>City</span>
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('city')}
                      />
                      {editBranchErrors.city && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        <span>Address line 1</span>
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('addressLine1')}
                      />
                      {editBranchErrors.addressLine1 && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.addressLine1.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Address line 2 (optional)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('addressLine2')}
                      />
                      {editBranchErrors.addressLine2 && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.addressLine2.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Postal code (optional)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('postalCode')}
                      />
                      {editBranchErrors.postalCode && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.postalCode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        <span>Country</span>
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('country')}
                      />
                      {editBranchErrors.country && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.country.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Status
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('status')}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="closed">Closed</option>
                      </select>
                      {editBranchErrors.status && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.status.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Latitude (optional)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('lat')}
                      />
                      {editBranchErrors.lat && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.lat.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Longitude (optional)
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        {...registerEditBranch('lng')}
                      />
                      {editBranchErrors.lng && (
                        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                          {editBranchErrors.lng.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingBranch(null)}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingEditBranch}
                        className="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {isSubmittingEditBranch ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </form>
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
