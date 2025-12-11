'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useBranchOrders } from './hooks';
import type { OrderStatus } from '@/types/orders';
import type { User } from '@/types/api';

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
  const { orders, loading, error, updatingIds, updateStatus, reload, assignRider } =
    useBranchOrders(branchId);
  const [branchLabel, setBranchLabel] = useState<string | null>(null);
  const [riderSearchQuery, setRiderSearchQuery] = useState('');
  const [riderSearchLoading, setRiderSearchLoading] = useState(false);
  const [riderResults, setRiderResults] = useState<User[]>([]);
  const [selectedRiders, setSelectedRiders] = useState<Record<string, string>>({});

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

  const searchRiders = async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setRiderSearchLoading(true);

    try {
      const query = riderSearchQuery.trim();
      const url = query.length
        ? `/users/riders?q=${encodeURIComponent(query)}`
        : '/users/riders';
      const data = await api.get<User[]>(url, token);
      setRiderResults(data ?? []);
      if (!data || data.length === 0) {
        toast.message('No riders found for that search.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to search riders';
      toast.error(message);
    } finally {
      setRiderSearchLoading(false);
    }
  };

  const hasOrders = orders.length > 0;

  const renderStatusBadge = (status: OrderStatus) => {
    const palette: Record<OrderStatus, string> = {
      created: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
      accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
      preparing:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100',
      completed:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
      cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${palette[status]}`}
      >
        {status}
      </span>
    );
  };

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

        {!error && (
          <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Find riders
              </div>
              <input
                type="text"
                value={riderSearchQuery}
                onChange={(event) => setRiderSearchQuery(event.target.value)}
                placeholder="Search by rider email"
                className="w-56 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={() => void searchRiders()}
                disabled={riderSearchLoading}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {riderSearchLoading ? 'Searching...' : 'Search riders'}
              </button>
              {riderResults.length > 0 && (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {riderResults.length} result{riderResults.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Search riders by email, then select per order below.
            </p>
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
              const selectedRiderId = selectedRiders[order.id] ?? '';

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
                        <div className="mt-1 flex items-center justify-end gap-2">
                          {renderStatusBadge(order.status as OrderStatus)}
                          {isUpdating && (
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Updating…
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                        ৳ {order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-right text-[11px] text-zinc-600 dark:text-zinc-400">
                        <span className="font-semibold">Rider:</span>{' '}
                        {order.rider?.email || order.rider?.id ? (
                          order.rider.email || order.rider.id
                        ) : (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                            Unassigned
                          </span>
                        )}
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
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={selectedRiderId}
                          onChange={(event) =>
                            setSelectedRiders((prev) => ({
                              ...prev,
                              [order.id]: event.target.value,
                            }))
                          }
                          className="w-52 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        >
                          <option value="">Select rider</option>
                          {riderResults.map((rider) => (
                            <option key={rider.id} value={rider.id}>
                              {rider.email}
                              {rider.name ? ` — ${rider.name}` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedRiderId.trim()) {
                              toast.error('Select a rider before assigning.');
                              return;
                            }
                            void (async () => {
                              await assignRider(order.id, selectedRiderId.trim());
                              await reload();
                            })();
                          }}
                          disabled={isUpdating || riderSearchLoading || !selectedRiderId.trim()}
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        >
                          {isUpdating ? 'Assigning…' : 'Assign rider'}
                        </button>
                      </div>
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
