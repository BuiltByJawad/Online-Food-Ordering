'use client';

import type { ReactNode } from 'react';

type CartLine = {
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
};

type Props = {
  items: CartLine[];
  subtotal: number;
  promoDiscount: number;
  appliedPromoCode: string | null;
  finalTotal: number;
  error?: string | null;
  placed: boolean;
  hasItems: boolean;
  onClear: () => void;
  onViewOrders: () => void;
  headerAction?: ReactNode;
};

export function OrderSummary({
  items,
  subtotal,
  promoDiscount,
  appliedPromoCode,
  finalTotal,
  error,
  placed,
  hasItems,
  onClear,
  onViewOrders,
  headerAction,
}: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">
          Order summary
        </span>
        {headerAction ?? (
          <button
            type="button"
            className="text-xs text-zinc-600 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            disabled={!hasItems}
            onClick={onClear}
          >
            Clear cart
          </button>
        )}
      </div>

      {!hasItems && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Your cart is empty. Go back to a branch menu to add items.
        </p>
      )}

      {hasItems && (
        <div className="space-y-2">
          {items.map((line) => (
            <div
              key={line.itemId}
              className="flex items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {line.name}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {`৳ ${line.basePrice.toFixed(2)} x ${line.quantity}`}
                </p>
              </div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                {`৳ ${(line.basePrice * line.quantity).toFixed(2)}`}
              </div>
            </div>
          ))}

          <div className="mt-2 space-y-1 border-t border-dashed border-zinc-200 pt-2 text-sm dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700 dark:text-zinc-200">Subtotal</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {`৳ ${subtotal.toFixed(2)}`}
              </span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1 text-xs font-semibold">
                  Promo {appliedPromoCode ? `(${appliedPromoCode})` : ''}
                </span>
                <span className="text-sm font-semibold">{`- ৳ ${promoDiscount.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              <span>Total</span>
              <span>{`৳ ${finalTotal.toFixed(2)}`}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {placed && !hasItems && !error && (
        <div className="space-y-1">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Your order has been placed. You can view it from your orders page.
          </p>
          <button
            type="button"
            onClick={onViewOrders}
            className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            View my orders
          </button>
        </div>
      )}
    </div>
  );
}
