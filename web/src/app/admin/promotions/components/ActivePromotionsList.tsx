'use client';

import type { Promotion } from '../types/promotion';

type Props = {
  loading: boolean;
  activePromos: Promotion[];
};

export function ActivePromotionsList({ loading, activePromos }: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Active promotions
        </h2>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {loading ? 'Loading...' : `${activePromos.length} active`}
        </span>
      </div>
      {loading && <p className="text-sm text-zinc-500">Loading promotions...</p>}
      {!loading && activePromos.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No active promotions.
        </p>
      )}
      <div className="space-y-2">
        {activePromos.map((promo) => {
          const window =
            promo.validFrom || promo.validTo
              ? `${promo.validFrom ? new Date(promo.validFrom).toLocaleString() : '—'} → ${
                  promo.validTo ? new Date(promo.validTo).toLocaleString() : '—'
                }`
              : 'No window';
          return (
            <div
              key={promo.id}
              className="rounded-md border border-zinc-200 p-3 text-sm shadow-sm dark:border-zinc-700"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                    {promo.code}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {promo.discountType === 'percent'
                      ? `${promo.discountValue}%`
                      : `৳ ${promo.discountValue.toFixed(2)}`}
                    {promo.maxDiscount
                      ? ` (cap ৳ ${Number(promo.maxDiscount).toFixed(2)})`
                      : ''}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500">
                  {promo.maxUses > 0
                    ? `${promo.usageCount}/${promo.maxUses} uses`
                    : `${promo.usageCount} used`}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Per-user: {promo.perUserLimit || '∞'}</span>
                <span>Branch: {promo.branchId ? promo.branchId : 'Any'}</span>
                <span>{window}</span>
                <span>Status: {promo.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
