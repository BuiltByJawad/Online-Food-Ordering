'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import type { Vendor, Branch } from '@/types/api';
import type { BranchFormValues } from './schemas';

export function useVendorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const loadVendor = async () => {
      const token = getAccessToken();

      if (!token) {
        toast.error('You are not logged in.');
        router.replace('/auth/login');
        return;
      }

      try {
        const user = await fetchCurrentUser(token);

        if (user.role !== 'vendor_manager') {
          toast.error('You do not have access to the vendor portal.');
          router.replace('/');
          return;
        }

        const vendorData = await api.get<Vendor>('/vendors/me', token);
        setVendor(vendorData);

        const branchesData = await api.get<Branch[]>(
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

  const refreshBranches = async (): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    if (!vendor) {
      toast.error('Vendor is not loaded yet.');
      return false;
    }

    try {
      const branchesData = await api.get<Branch[]>(
        `/vendors/${vendor.id}/branches`,
        token,
      );
      setBranches(branchesData);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load branches';
      toast.error(message);
      return false;
    }
  };

  const createBranch = async (
    values: BranchFormValues,
  ): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    if (!vendor) {
      toast.error('Vendor is not loaded yet.');
      return false;
    }

    try {
      await api.post<Branch>(
        `/vendors/${vendor.id}/branches`,
        {
          name: values.name,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2 || undefined,
          city: values.city,
          postalCode: values.postalCode || undefined,
          country: values.country,
          lat: values.lat ? Number(values.lat) : undefined,
          lng: values.lng ? Number(values.lng) : undefined,
        },
        token,
      );

      toast.success('Branch created.');
      await refreshBranches();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create branch';
      toast.error(message);
      return false;
    }
  };

  const updateBranch = async (
    branchId: string,
    values: BranchFormValues,
  ): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    if (!vendor) {
      toast.error('Vendor is not loaded yet.');
      return false;
    }

    try {
      const updated = await api.patch<Branch>(
        `/vendors/${vendor.id}/branches/${branchId}`,
        {
          name: values.name,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2 || undefined,
          city: values.city,
          postalCode: values.postalCode || undefined,
          country: values.country,
          lat: values.lat ? Number(values.lat) : undefined,
          lng: values.lng ? Number(values.lng) : undefined,
          status: values.status,
        },
        token,
      );

      setBranches((prev) =>
        prev.map((branch) => (branch.id === updated.id ? updated : branch)),
      );
      toast.success('Branch updated.');
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update branch';
      toast.error(message);
      return false;
    }
  };

  const deleteBranch = async (branchId: string): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    if (!vendor) {
      toast.error('Vendor is not loaded yet.');
      return false;
    }

    try {
      await api.delete<void>(
        `/vendors/${vendor.id}/branches/${branchId}`,
        token,
      );

      setBranches((prev) =>
        prev.filter((branch) => branch.id !== branchId),
      );
      toast.success('Branch deleted.');
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete branch';
      toast.error(message);
      return false;
    }
  };

  return {
    loading,
    vendor,
    branches,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}
