'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { Order } from '@/types/orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    api
      .get<Order[]>('/orders', token)
      .then((data) => {
        if (!isActive) return;
        setOrders(data ?? []);
      })
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

  return { orders, loading, error };
}
