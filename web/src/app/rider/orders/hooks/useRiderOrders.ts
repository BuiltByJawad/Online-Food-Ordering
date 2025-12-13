'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import {
  createOrdersSocket,
  type OrderRiderAssignedEvent,
  type OrderStatusUpdatedEvent,
  type OrdersSocket,
} from '@/lib/realtime';
import type { Order, OrderStatus } from '@/types/orders';
import { fetchRiderOrders, updateRiderOrderStatus } from '../services/orders';

type UseRiderOrdersResult = {
  loading: boolean;
  error: string | null;
  orders: Order[];
  updatingIds: Set<string>;
  reload: () => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
};

let ordersCache: Order[] | null = null;

export function useRiderOrders(): UseRiderOrdersResult {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const prevStatusRef = useRef<Record<string, string>>({});
  const socketRef = useRef<OrdersSocket | null>(null);

  const applyOrders = useCallback((list: Order[], { showToasts }: { showToasts: boolean }) => {
    if (showToasts) {
      for (const order of list) {
        const prevStatus = prevStatusRef.current[order.id];
        if (prevStatus && prevStatus !== order.status) {
          const label = order.status.charAt(0).toUpperCase() + order.status.slice(1);
          toast.message(`Order ${order.id} is now ${label}`);
        }
      }
    }
    const statusMap: Record<string, string> = {};
    list.forEach((o) => {
      statusMap[o.id] = o.status;
    });
    prevStatusRef.current = statusMap;
    setOrders(list);
  }, []);

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
      const current = await fetchCurrentUser(token);
      if (current.role !== 'rider') {
        toast.error('You do not have access to the rider portal.');
        router.replace('/');
        return;
      }

      if (ordersCache) {
        applyOrders(ordersCache, { showToasts: false });
      }

      const data = await fetchRiderOrders(token);
      const list = data ?? [];
      ordersCache = list;
      applyOrders(list, { showToasts: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load rider orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [applyOrders, router]);

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
        return next;
      });
    });

    socket.on('order.rider.assigned', (payload: OrderRiderAssignedEvent) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payload.orderId ? { ...o, rider: payload.riderId ? { id: payload.riderId } : null } : o,
        ),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [load]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
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
        const updated = await updateRiderOrderStatus(orderId, status, token);
        setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
        ordersCache = null; // refresh next load
        toast.success('Delivery status updated.');
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to update delivery status';
        toast.error(message);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    },
    [router],
  );

  return {
    loading,
    error,
    orders,
    updatingIds,
    reload: load,
    updateStatus,
  };
}
