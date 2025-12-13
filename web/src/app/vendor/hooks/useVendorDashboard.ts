'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import type { Vendor, Branch } from '@/types/api';
import type { BranchFormValues } from '../schemas';
import {
  fetchVendorProfile,
  fetchVendorBranches,
  createVendorBranch,
  updateVendorBranch,
  deleteVendorBranch,
} from '../services/vendor';

export function useVendorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const cache = useRef<Branch[] | null>(null);

  const loadVendor = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const user = await fetchCurrentUser(token);

      if (user.role !== 'vendor_manager') {
        toast.error('You do not have access to the vendor portal.');
        router.replace('/');
        return;
      }

      const vendorData = await fetchVendorProfile(token);
      setVendor(vendorData);

      if (cache.current) {
        setBranches(cache.current);
      }

      const branchesData = await fetchVendorBranches(vendorData.id, token);
      const list = branchesData ?? [];
      cache.current = list;
      setBranches(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load vendor data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadVendor();
  }, [loadVendor]);

  const refreshBranches = useCallback(async (): Promise<boolean> => {
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
      const branchesData = await fetchVendorBranches(vendor.id, token);
      const list = branchesData ?? [];
      cache.current = list;
      setBranches(list);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load branches';
      toast.error(message);
      return false;
    }
  }, [vendor]);

  const createBranchAction = useCallback(
    async (values: BranchFormValues): Promise<boolean> => {
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
        await createVendorBranch(vendor.id, values, token);
        toast.success('Branch created.');
        cache.current = null;
        await refreshBranches();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create branch';
        toast.error(message);
        return false;
      }
    },
    [refreshBranches, vendor],
  );

  const updateBranchAction = useCallback(
    async (branchId: string, values: BranchFormValues): Promise<boolean> => {
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
        const updated = await updateVendorBranch(vendor.id, branchId, values, token);
        setBranches((prev) => prev.map((branch) => (branch.id === updated.id ? updated : branch)));
        cache.current = null;
        toast.success('Branch updated.');
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update branch';
        toast.error(message);
        return false;
      }
    },
    [vendor],
  );

  const deleteBranchAction = useCallback(
    async (branchId: string): Promise<boolean> => {
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
        await deleteVendorBranch(vendor.id, branchId, token);
        setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
        cache.current = null;
        toast.success('Branch deleted.');
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete branch';
        toast.error(message);
        return false;
      }
    },
    [vendor],
  );

  return {
    loading,
    vendor,
    branches,
    createBranch: createBranchAction,
    updateBranch: updateBranchAction,
    deleteBranch: deleteBranchAction,
  };
}
