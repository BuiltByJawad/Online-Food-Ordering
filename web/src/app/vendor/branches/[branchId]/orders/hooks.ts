'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { Order, OrderStatus } from '@/types/orders';

interface UseBranchOrdersResult {
  loading: boolean;
  error: string | null;
  orders: Order[];
  updatingIds: Set<string>;
  reload: () => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  assignRider: (orderId: string, riderUserId: string) => Promise<void>;
}

export function useBranchOrders(branchId: string): UseBranchOrdersResult {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const load = async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.get<Order[]>(`/orders/branch/${branchId}`, token);
      setOrders(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const assignRider = async (orderId: string, riderUserId: string) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });

    try {
      const updated = await api.patch<Order>(
        `/orders/${orderId}/assign-rider`,
        { riderUserId },
        token,
      );
      setOrders((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      toast.success('Rider assigned.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to assign rider';
      toast.error(message);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  useEffect(() => {
    void load();
  }, [branchId]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });

    try {
      const updated = await api.patch<Order>(
        `/orders/${orderId}/status`,
        { status },
        token,
      );

      setOrders((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      toast.success('Order status updated.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update order status';
      toast.error(message);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  return {
    loading,
    error,
    orders,
    updatingIds,
    reload: load,
    updateStatus,
    assignRider,
  };
}
