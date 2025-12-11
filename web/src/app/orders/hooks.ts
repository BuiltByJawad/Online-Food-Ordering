'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { Order } from '@/types/orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (
    token: string,
    isActive?: () => boolean,
  ): Promise<void> => {
    const data = await api.get<Order[]>('/orders', token);

    if (isActive && !isActive()) return;

    setOrders(data ?? []);
  };

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setLoading(false);
      setError('AUTH_REQUIRED');
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);

    fetchOrders(token, () => isActive)
      .catch((err: any) => {
        if (!isActive) return;
        setError(err?.message ?? 'Failed to load orders');
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const reload = async (): Promise<void> => {
    const token = getAccessToken();

    if (!token) {
      setError('AUTH_REQUIRED');
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchOrders(token);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error, reload };
}
