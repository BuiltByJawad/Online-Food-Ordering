'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth';
import {
  createOrdersSocket,
  type OrderRiderAssignedEvent,
  type OrderStatusUpdatedEvent,
  type OrdersSocket,
} from '@/lib/realtime';
import type { Order } from '@/types/orders';
import {
  fetchBranchInfo,
  fetchOrderReview,
  fetchOrders,
  submitReview,
  type BranchPublicInfo,
} from '../services/orders';
import { reviewSchema, type ReviewFormValues } from '../schemas';

const POLL_INTERVAL_MS = 15_000;

export function useOrders() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [branchLabels, setBranchLabels] = useState<Record<string, string>>({});
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const prevStatusRef = useRef<Record<string, string>>({});
  const socketRef = useRef<OrdersSocket | null>(null);

  const ordersCache = useRef<Order[] | null>(null);
  const branchCache = useRef<Record<string, BranchPublicInfo>>({});
  const reviewCache = useRef<Record<string, boolean>>({});

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema) as Resolver<ReviewFormValues>,
    defaultValues: { rating: 5, comment: '' },
  });

  const applyOrders = useCallback(
    (next: Order[], { showToasts }: { showToasts: boolean }) => {
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
    },
    [],
  );

  const loadOrders = useCallback(
    async (token: string, isActive?: () => boolean, opts: { showToasts: boolean } = { showToasts: false }) => {
      const data = await fetchOrders(token);
      if (isActive && !isActive()) return;
      applyOrders(data ?? [], opts);
      ordersCache.current = data ?? [];
    },
    [applyOrders],
  );

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setAuthRequired(true);
      setLoading(false);
      setError('AUTH_REQUIRED');
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);

    if (ordersCache.current) {
      applyOrders(ordersCache.current, { showToasts: false });
    }

    loadOrders(token, () => isActive)
      .catch((err: unknown) => {
        if (!isActive) return;
        const message = err instanceof Error ? err.message : 'Failed to load orders';
        setError(message);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    const timer = setInterval(() => {
      if (!isActive) return;
      void loadOrders(token, () => isActive, { showToasts: true }).catch(() => {});
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
  }, [applyOrders, loadOrders]);

  // Branch info caching
  useEffect(() => {
    const ids = Array.from(
      new Set(
        orders
          .map((o) => o.branchId)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    );
    const missing = ids.filter((id) => !branchCache.current[id]);
    if (missing.length === 0) {
      if (Object.keys(branchCache.current).length > 0) {
        const labels: Record<string, string> = {};
        Object.values(branchCache.current).forEach((info) => {
          const vendorPrefix =
            info.vendorName && info.vendorName !== info.name ? `${info.vendorName} - ` : '';
          const citySuffix = info.city ? ` (${info.city})` : '';
          labels[info.id] = `${vendorPrefix}${info.name}${citySuffix}`;
        });
        setBranchLabels(labels);
      }
      return;
    }

    let isActive = true;
    Promise.all(
      missing.map((id) =>
        fetchBranchInfo(id)
          .then((data) => ({ id, data }))
          .catch(() => ({ id, data: null })),
      ),
    ).then((results) => {
      if (!isActive) return;
      const next = { ...branchCache.current };
      results.forEach(({ id, data }) => {
        if (data) {
          next[id] = data;
        }
      });
      branchCache.current = next;
      const labels: Record<string, string> = {};
      Object.values(next).forEach((info) => {
        const vendorPrefix =
          info.vendorName && info.vendorName !== info.name ? `${info.vendorName} - ` : '';
        const citySuffix = info.city ? ` (${info.city})` : '';
        labels[info.id] = `${vendorPrefix}${info.name}${citySuffix}`;
      });
      setBranchLabels(labels);
    });

    return () => {
      isActive = false;
    };
  }, [orders]);

  // Review presence caching
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const completed = orders.filter((o) => o.status === 'completed');
    const pending = completed.filter((o) => reviewCache.current[o.id] === undefined);
    if (pending.length === 0) return;

    let isActive = true;
    Promise.all(
      pending.map((o) =>
        fetchOrderReview(o.id, token)
          .then((data) => ({ id: o.id, hasReview: Boolean(data) }))
          .catch(() => ({ id: o.id, hasReview: false })),
      ),
    ).then((results) => {
      if (!isActive) return;
      const next = { ...reviewCache.current };
      results.forEach((r) => {
        next[r.id] = r.hasReview;
      });
      reviewCache.current = next;
      setReviewed((prev) => ({ ...prev, ...next }));
    });

    return () => {
      isActive = false;
    };
  }, [orders]);

  const reload = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setAuthRequired(true);
      setError('AUTH_REQUIRED');
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loadOrders(token, undefined, { showToasts: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  const openReview = (orderId: string) => {
    reviewForm.reset({ rating: 5, comment: '' });
    setActiveOrderId(orderId);
  };

  const closeReview = () => {
    setActiveOrderId(null);
  };

  const handleSubmitReview = reviewForm.handleSubmit(async (values: ReviewFormValues) => {
    if (!activeOrderId) return;
    const token = getAccessToken();
    if (!token) {
      toast.error('Please sign in to review your order.');
      router.push('/auth/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview({ orderId: activeOrderId, ...values }, token);
      toast.success('Thanks for your feedback!');
      reviewCache.current[activeOrderId] = true;
      setReviewed((prev) => ({ ...prev, [activeOrderId]: true }));
      setActiveOrderId(null);
      await reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  });

  return {
    orders,
    loading,
    error,
    authRequired,
    branchLabels,
    reviewed,
    reload,
    review: {
      activeOrderId,
      openReview,
      closeReview,
      submittingReview,
      form: reviewForm,
      handleSubmitReview,
    },
  };
}
