'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useBranchOrders, type OrderStatus } from './hooks';

interface BranchOrdersPageProps {
  params: {
    branchId: string;
  };
}

interface BranchPublicInfo {
  id: string;
  name: string;
  city: string;
  country: string;
  vendorName: string | null;
}

const STATUS_OPTIONS: OrderStatus[] = [
  'created',
  'accepted',
  'preparing',
  'completed',
  'cancelled',
];

export default function BranchOrdersPage({ params }: BranchOrdersPageProps) {
  const { branchId } = params;
  const router = useRouter();
  const { orders, loading, error, updatingIds, updateStatus, reload } =
    useBranchOrders(branchId);
  const [branchLabel, setBranchLabel] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get<BranchPublicInfo>(`/branches/${branchId}/info`)
      .then((data) => {
        if (!active || !data) return;
        const vendorPrefix =
          data.vendorName && data.vendorName !== data.name
            ? `${data.vendorName} - `
            : '';
        const citySuffix = data.city ? ` (${data.city})` : '';
        setBranchLabel(`${vendorPrefix}${data.name}${citySuffix}`);
      })
      .catch(() => {
        // Ignore, header will just use the branch id.
      });

    return () => {
      active = false;
    };
  }, [branchId]);

  const hasOrders = orders.length > 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
        <div className="flex w-full max-w-5xl flex-col gap-6 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="flex w-full max-w-5xl flex-col gap-6 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Branch orders
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {branchLabel
                ? `Orders for ${branchLabel}`
                : `Orders for branch ${branchId}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/vendor')}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Back to vendor portal
          </button>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => reload()}
              className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium hover:bg-red-100 dark:border-red-500 dark:hover:bg-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {!error && !hasOrders && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            No orders have been placed for this branch yet.
          </div>
        )}

        {!error && hasOrders && (
          <div className="space-y-4">
            {orders.map((order) => {
              const isUpdating = updatingIds.has(order.id);

              return (
                <div
                  key={order.id}
                  className="space-y-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Order
                      </p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {order.id}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {order.items.length} item
                        {order.items.length === 1 ? '' : 's'}
                      </p>
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
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Status
                        </p>
                        <p className="text-sm font-medium capitalize text-zinc-900 dark:text-zinc-50">
                          {order.status}
                        </p>
                      </div>
                      <div className="text-right text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                        ৳ {order.totalAmount.toFixed(2)}
                      </div>
                      <select
                        value={order.status}
                        disabled={isUpdating}
                        onChange={(event) =>
                          updateStatus(order.id, event.target.value as OrderStatus)
                        }
                        className="mt-1 w-40 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
