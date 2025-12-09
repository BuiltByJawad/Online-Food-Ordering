'use client';

import { useRouter } from 'next/navigation';
import { useOrders } from './hooks';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error } = useOrders();

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
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Back home
          </button>
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
                <div className="flex items-center justify-between">
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
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Status
                    </p>
                    <p className="text-sm font-medium capitalize text-zinc-900 dark:text-zinc-50">
                      {order.status}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                      {`৳ ${order.totalAmount.toFixed(2)}`}
                    </p>
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
