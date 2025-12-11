'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useOrders } from './hooks';
import type { OrderStatus } from '@/types/orders';

interface BranchPublicInfo {
  id: string;
  name: string;
  city: string;
  country: string;
  vendorName: string | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error, reload } = useOrders();

  const [branchLabels, setBranchLabels] = useState<Record<string, string>>({});

  const branchIds = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .map((order) => order.branchId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0),
        ),
      ),
    [orders],
  );

  useEffect(() => {
    if (branchIds.length === 0) {
      setBranchLabels({});
      return;
    }

    let isActive = true;

    const load = async () => {
      try {
        const results = await Promise.all(
          branchIds.map((id) =>
            api
              .get<BranchPublicInfo>(`/branches/${id}/info`)
              .then((data) => ({ id, data }))
              .catch(() => ({ id, data: null })),
          ),
        );

        if (!isActive) return;

        const next: Record<string, string> = {};

        for (const { id, data } of results) {
          if (!data) continue;

          const vendorPrefix =
            data.vendorName && data.vendorName !== data.name
              ? `${data.vendorName} - `
              : '';
          const citySuffix = data.city ? ` (${data.city})` : '';

          next[id] = `${vendorPrefix}${data.name}${citySuffix}`;
        }

        setBranchLabels(next);
      } catch {
        // If branch lookup fails, we silently fall back to showing the raw branch ID.
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [branchIds]);

  const statusSteps: OrderStatus[] = ['created', 'accepted', 'preparing', 'completed'];

  const renderTimeline = (status: string) => {
    if (status === 'cancelled') {
      return (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-200">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Order was cancelled</span>
        </div>
      );
    }

    const activeIndex = statusSteps.findIndex((s) => s === status);

    return (
      <div className="mt-2 flex items-center gap-3">
        {statusSteps.map((step, index) => {
          const isActive = activeIndex >= index;
          const isCurrent = activeIndex === index;
          return (
            <div key={step} className="flex items-center gap-1 text-[11px]">
              <span
                className={`h-3 w-3 rounded-full border ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                } ${isCurrent ? 'ring-2 ring-emerald-200 dark:ring-emerald-900/40' : ''}`}
                aria-label={step}
                title={step}
              />
              <span
                className={`capitalize ${
                  isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {step}
              </span>
              {index < statusSteps.length - 1 && (
                <span className="mx-1 h-px w-6 bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderEta = (status: string) => {
    if (status === 'cancelled') return 'No delivery — order cancelled';
    if (status === 'completed') return 'Delivered';
    if (status === 'preparing') return 'ETA ~15-25 min (prep in progress)';
    if (status === 'accepted') return 'ETA ~20-30 min (accepted by vendor)';
    return 'Awaiting vendor acceptance';
  };

  const renderStatusBadge = (status: string) => {
    const base =
      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium';
    let colors =
      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';

    switch (status) {
      case 'created':
        colors =
          'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
        break;
      case 'accepted':
        colors =
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
        break;
      case 'preparing':
        colors =
          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
        break;
      case 'completed':
        colors =
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
        break;
      case 'cancelled':
        colors =
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
        break;
      default:
        break;
    }

    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <span className={`${base} ${colors}`} aria-label={`Status: ${label}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const authRequired = error === 'AUTH_REQUIRED';

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="w-full max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              My orders
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              View the orders you have placed with this account.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reload()}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Back home
            </button>
          </div>
        </div>

        {authRequired && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100">
            <p className="mb-2">You need to be logged in to view your orders.</p>
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="rounded-md bg-amber-900 px-3 py-1.5 text-xs font-medium text-amber-50 hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-900 dark:hover:bg-amber-100"
            >
              Go to login
            </button>
          </div>
        )}

        {!authRequired && error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
            {error}
          </div>
        )}

        {!authRequired && !error && orders.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            You have not placed any orders yet.
          </div>
        )}

        {!authRequired && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="space-y-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Order
                    </p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {order.id}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                        Placed {new Date(order.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {order.updatedAt && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                          Updated {new Date(order.updatedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      )}
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold dark:bg-zinc-800">
                        {renderStatusBadge(order.status)}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                        ৳ {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    {order.branchId && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {branchLabels[order.branchId]
                          ? `From: ${branchLabels[order.branchId]}`
                          : `Branch ID: ${order.branchId}`}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {renderEta(order.status)}
                    </p>
                    {renderTimeline(order.status)}
                    {order.deliveryAddress && (
                      <div className="mt-1 space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                        <p className="font-medium text-zinc-700 dark:text-zinc-300">
                          Delivery address
                        </p>
                        <p>
                          {order.deliveryAddress.line1}
                          {order.deliveryAddress.line2
                            ? `, ${order.deliveryAddress.line2}`
                            : ''}
                        </p>
                        <p>
                          {order.deliveryAddress.city}
                          {order.deliveryAddress.postalCode
                            ? ` ${order.deliveryAddress.postalCode}`
                            : ''}
                          {order.deliveryAddress.country
                            ? `, ${order.deliveryAddress.country}`
                            : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-1 border-t border-dashed border-zinc-200 pt-2 text-xs dark:border-zinc-700">
                  {order.items.map((line) => (
                    <div
                      key={line.itemId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {line.name}
                        </p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          {`৳ ${line.basePrice.toFixed(2)} x ${line.quantity}`}
                        </p>
                      </div>
                      <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-50">
                        {`৳ ${(line.basePrice * line.quantity).toFixed(2)}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
