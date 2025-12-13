'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ensureAdmin } from '../../auth';
import { getAccessToken } from '@/lib/auth';
import { fetchVendors, createVendor as createVendorService } from '../services/vendors';
import type { VendorFormValues } from '../schemas';
import type { AdminVendor } from '../types/vendor';
import type { User } from '@/types/api';

export function useVendors(users: User[]) {
  const router = useRouter();
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<AdminVendor[] | null>(null);

  const vendorManagers = useMemo(
    () => users.filter((user) => user.role === 'vendor_manager'),
    [users],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (cache.current) {
      setVendors(cache.current);
    }

    try {
      const ctx = await ensureAdmin(router);
      if (!ctx) return;
      const data = await fetchVendors(ctx.token);
      setVendors(data ?? []);
      cache.current = data ?? [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load vendors';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const createVendor = useCallback(
    async (values: VendorFormValues) => {
      const token = getAccessToken();
      if (!token) {
        toast.error('You are not logged in.');
        router.replace('/auth/login');
        return false;
      }
      setCreating(true);
      try {
        const created = await createVendorService(values, token);
        setVendors((prev) => [created, ...prev]);
        cache.current = null; // refresh next load
        toast.success('Vendor created.');
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create vendor';
        toast.error(message);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [router],
  );

  return {
    vendors,
    vendorManagers,
    loading,
    creating,
    error,
    reload: load,
    createVendor,
  };
}
