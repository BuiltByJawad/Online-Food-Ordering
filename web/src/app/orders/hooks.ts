'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import {
  createOrdersSocket,
  type OrdersSocket,
  type OrderStatusUpdatedEvent,
  type OrderRiderAssignedEvent,
} from '@/lib/realtime';
import type { Order } from '@/types/orders';

const POLL_INTERVAL_MS = 15_000;

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevStatusRef = useRef<Record<string, string>>({});
  const socketRef = useRef<OrdersSocket | null>(null);

  const applyOrders = (next: Order[], { showToasts }: { showToasts: boolean }) => {
    if (showToasts) {
      for (const order of next) {
        const prevStatus = prevStatusRef.current[order.id];
        if (prevStatus && prevStatus !== order.status) {
          const label = order.status.charAt(0).toUpperCase() + order.status.slice(1);
          toast.message(`Order ${order.id} is now ${label}`);
        }
      }
    }

    const statusMap: Record<string, string> = {};
    next.forEach((o) => {
      statusMap[o.id] = o.status;
    });
    prevStatusRef.current = statusMap;
    setOrders(next);
  };

  const fetchOrders = async (
    token: string,
    isActive?: () => boolean,
    options: { showToasts: boolean } = { showToasts: false },
  ): Promise<void> => {
    const data = await api.get<Order[]>('/orders', token);

    if (isActive && !isActive()) return;

    applyOrders(data ?? [], options);
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

    const timer = setInterval(() => {
      if (!isActive) return;
      void fetchOrders(token, () => isActive, { showToasts: true }).catch(() => {});
    }, POLL_INTERVAL_MS);

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
        // update status map
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
      toast.message(`Order ${payload.orderId} assigned to rider`);
    });

    return () => {
      isActive = false;
      clearInterval(timer);
      socket.disconnect();
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
      await fetchOrders(token, undefined, { showToasts: false });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error, reload };
}
