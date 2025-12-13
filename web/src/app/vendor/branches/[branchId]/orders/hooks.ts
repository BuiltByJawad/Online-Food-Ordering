'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth';
import {
  createOrdersSocket,
  type OrdersSocket,
  type OrderStatusUpdatedEvent,
  type OrderRiderAssignedEvent,
} from '@/lib/realtime';
import type { Order, OrderStatus } from '@/types/orders';
import {
  fetchBranchOrders,
  updateBranchOrderStatus,
  assignBranchOrderRider,
} from './services/orders';

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
  const prevStatusRef = useRef<Record<string, string>>({});
  const socketRef = useRef<OrdersSocket | null>(null);
  const cache = useRef<Order[] | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (cache.current) {
        setOrders(cache.current);
      }
      const data = await fetchBranchOrders(branchId, token);
      const list = data ?? [];
      cache.current = list;
      setOrders(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, router]);

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
      const updated = await assignBranchOrderRider(orderId, riderUserId, token);
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

    const token = getAccessToken();
    if (!token) return;

    const socket = createOrdersSocket(token);
    socketRef.current = socket;

    socket.on('order.status.updated', (payload: OrderStatusUpdatedEvent) => {
      setOrders((prev) => {
        const next = prev.map((o) =>
          o.id === payload.orderId ? { ...o, status: payload.status, rider: o.rider } : o,
        );
        const prevStatus = prevStatusRef.current[payload.orderId];
        if (prevStatus && prevStatus !== payload.status) {
          const label = payload.status.charAt(0).toUpperCase() + payload.status.slice(1);
          toast.message(`Order ${payload.orderId} is now ${label}`);
        }
        const statusMap: Record<string, string> = {};
        next.forEach((o) => {
          statusMap[o.id] = o.status;
        });
        prevStatusRef.current = statusMap;
        cache.current = next;
        return next;
      });
    });

    socket.on('order.rider.assigned', (payload: OrderRiderAssignedEvent) => {
      setOrders((prev) => {
        const next = prev.map((o) =>
          o.id === payload.orderId ? { ...o, rider: payload.riderId ? { id: payload.riderId } : null } : o,
        );
        cache.current = next;
        return next;
      });
      toast.message(`Order ${payload.orderId} assigned to rider`);
    });

    return () => {
      socket.disconnect();
    };
  }, [branchId, load]);

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
      const updated = await updateBranchOrderStatus(orderId, status, token);

      setOrders((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      cache.current = null;
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
