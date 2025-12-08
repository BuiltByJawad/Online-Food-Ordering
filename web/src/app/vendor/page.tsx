'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  role: string;
}

interface BranchSummary {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  country: string;
  status: string;
}

interface VendorSummary {
  id: string;
  name: string;
  brandName?: string;
  legalName?: string;
  status: string;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorSummary | null>(null);
  const [branches, setBranches] = useState<BranchSummary[]>([]);

  useEffect(() => {
    const loadVendor = async () => {
      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('accessToken')
          : null;

      if (!token) {
        toast.error('You are not logged in.');
        router.replace('/auth/login');
        return;
      }

      try {
        const user = await api.get<UserProfile>('/users/me', token);

        if (user.role !== 'vendor_manager') {
          toast.error('You do not have access to the vendor portal.');
          router.replace('/');
          return;
        }

        const vendorData = await api.get<VendorSummary>('/vendors/me', token);
        setVendor(vendorData);

        const branchesData = await api.get<BranchSummary[]>(
          `/vendors/${vendorData.id}/branches`,
          token,
        );
        setBranches(branchesData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load vendor data';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadVendor();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Loading vendor portal...
        </p>
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
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/vendor/branches/${branch.id}/menu`)}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Manage menu
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
