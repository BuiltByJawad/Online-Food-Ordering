'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { ensureAdmin } from '../auth';
import type { User, Vendor } from '@/types/api';

export interface AdminVendor extends Vendor {
  owner: User;
  createdAt?: string;
}

interface UseAdminVendorsResult {
  loading: boolean;
  vendors: AdminVendor[];
  error: string | null;
  creating: boolean;
  reload: () => Promise<void>;
  createVendor: (payload: {
    ownerUserId: string;
    name: string;
    brandName?: string;
    legalName?: string;
    taxId?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    commissionRate?: number;
    payoutCycle?: string;
  }) => Promise<void>;
}

export function useAdminVendors(): UseAdminVendorsResult {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const context = await ensureAdmin(router);
      if (!context) {
        return;
      }

      const data = await api.get<AdminVendor[]>('/vendors', context.token);
      setVendors(data ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load vendors';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const createVendor: UseAdminVendorsResult['createVendor'] = async (
    payload,
  ) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setCreating(true);

    try {
      const created = await api.post<AdminVendor>('/vendors', payload, token);
      setVendors((prev) => [created, ...prev]);
      toast.success('Vendor created.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create vendor';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return {
    loading,
    vendors,
    error,
    creating,
    reload: load,
    createVendor,
  };
}
