'use client';

import { useMemo } from 'react';
import { useBranchAnalytics } from './hooks/useBranchAnalytics';

interface BranchAnalyticsPageProps {
  params: {
    branchId: string;
  };
}

const DAY_WINDOWS = [7, 14, 30] as const;

export default function BranchAnalyticsPage({ params }: BranchAnalyticsPageProps) {
  const { branchId } = params;
  const { loading, branchLabel, analytics, dayWindow, setDayWindow } =
    useBranchAnalytics(branchId);

  const totals = useMemo(() => {
    if (!analytics) {
      return { orders: 0, revenue: 0 };
    }
    const orders = analytics.ordersPerDay.reduce((sum, row) => sum + row.count, 0);
    const revenue = analytics.revenuePerDay.reduce((sum, row) => sum + row.total, 0);
    return { orders, revenue };
  }, [analytics]);

  const maxOrders = analytics
    ? Math.max(...analytics.ordersPerDay.map((row) => row.count), 1)
    : 1;
  const maxRevenue = analytics
    ? Math.max(...analytics.revenuePerDay.map((row) => row.total), 1)
    : 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Vendor Analytics
          </p>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {branchLabel ?? 'Branch Analytics'}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">Window:</span>
          <div className="flex items-center gap-1">
            {DAY_WINDOWS.map((d) => (
              <button
                key={d}
                onClick={() => setDayWindow(d)}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  dayWindow === d
                    ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          Loading analytics…
        </div>
      )}

      {!loading && !analytics && (
        <div className="rounded-lg border border-dashed border-amber-300/70 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-700/70 dark:bg-amber-900/20 dark:text-amber-100">
          No analytics available yet for this window.
        </div>
      )}

      {!loading && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Orders
              </p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {totals.orders}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Across {dayWindow} days</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Revenue
              </p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                ৳ {totals.revenue.toFixed(2)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Across {dayWindow} days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Orders per day
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Count</span>
              </div>
              <div className="flex items-end gap-2">
                {analytics.ordersPerDay.map((row) => (
                  <div key={row.date} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-zinc-900/80 dark:bg-zinc-100"
                      style={{
                        height: `${Math.max((row.count / maxOrders) * 140, 6)}px`,
                      }}
                      title={`${row.date}: ${row.count} orders`}
                    />
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {row.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Revenue per day
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">BDT</span>
              </div>
              <div className="flex items-end gap-2">
                {analytics.revenuePerDay.map((row) => (
                  <div key={row.date} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-emerald-600/80 dark:bg-emerald-300/90"
                      style={{
                        height: `${Math.max((row.total / maxRevenue) * 140, 6)}px`,
                      }}
                      title={`${row.date}: ৳ ${row.total.toFixed(2)}`}
                    />
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {row.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Top items</p>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Qty · Amount</span>
            </div>
            {analytics.topItems.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No items in this window.</p>
            ) : (
              <div className="space-y-2">
                {analytics.topItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-md border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {item.quantity} sold
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      ৳ {item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
