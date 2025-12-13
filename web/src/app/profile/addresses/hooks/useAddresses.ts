'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth';
import type { Address } from '@/types/api';
import type { AddressFormValues } from '../schemas';
import {
  fetchAddresses,
  createAddress,
  deleteAddress,
  makeDefaultAddress,
} from '../services/addresses';

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const cache = useRef<Address[] | null>(null);

  const loadAddresses = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      setLoading(false);
      return;
    }

    if (cache.current) {
      setAddresses(cache.current);
    }

    setLoading(true);
    try {
      const data = await fetchAddresses(token);
      setAddresses(data ?? []);
      cache.current = data ?? [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load addresses';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const submitAddress = async (values: AddressFormValues) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      await createAddress(values, token);
      toast.success('Address added.');
      cache.current = null;
      await loadAddresses();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add address';
      toast.error(message);
    }
  };

  const removeAddress = useCallback(
    async (id: string) => {
      const token = getAccessToken();

      if (!token) {
        toast.error('You are not logged in.');
        return;
      }

      try {
        await deleteAddress(id, token);
        toast.success('Address deleted.');
        cache.current = null;
        await loadAddresses();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete address';
        toast.error(message);
      }
    },
    [loadAddresses],
  );

  const setDefault = useCallback(
    async (id: string) => {
      const token = getAccessToken();

      if (!token) {
        toast.error('You are not logged in.');
        return;
      }

      try {
        await makeDefaultAddress(id, token);
        toast.success('Default address updated.');
        cache.current = null;
        await loadAddresses();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update address';
        toast.error(message);
      }
    },
    [loadAddresses],
  );

  return {
    addresses,
    loading,
    submitAddress,
    deleteAddress: removeAddress,
    makeDefault: setDefault,
  };
}
