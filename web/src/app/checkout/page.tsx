'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { CreateOrderPayload } from '@/types/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear, branchId } = useCart();
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasItems = items.length > 0;

  const handleConfirm = async () => {
    if (!hasItems || submitting) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreateOrderPayload = {
        items: items.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
        ...(branchId ? { branchId } : {}),
      };

      await api.post('/orders', payload, token);

      clear();
      setPlaced(true);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Checkout
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This is still a skeleton for the checkout flow. You can review your
          cart items and total below. In a real flow, you would now choose a
          delivery address and confirm payment.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                Order summary
              </span>
              <button
                type="button"
                className="text-xs text-zinc-600 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                disabled={!hasItems}
                onClick={() => clear()}
              >
                Clear cart
              </button>
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

                <div className="mt-2 flex items-center justify-between border-t border-dashed border-zinc-200 pt-2 text-sm dark:border-zinc-700">
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    Total
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {`৳ ${total.toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            {placed && !hasItems && !error && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Your order has been placed (demo only). You can close this page
                or go back home.
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800 md:w-auto"
          >
            Back home
          </button>

          <button
            type="button"
            disabled={!hasItems || submitting}
            onClick={handleConfirm}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 md:w-auto"
          >
            {submitting
              ? 'Placing order...'
              : placed
              ? 'Order placed'
              : 'Confirm order'}
          </button>
        </div>
      </div>
    </div>
  );
}
