'use client';

import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types/api';
import { useCustomerBranchMenu } from './hooks';
import { useCart } from '@/lib/cart';

interface CustomerBranchMenuPageProps {
  params: {
    branchId: string;
  };
}

export default function CustomerBranchMenuPage({
  params,
}: CustomerBranchMenuPageProps) {
  const { branchId } = params;
  const router = useRouter();
  const { categories, loading } = useCustomerBranchMenu(branchId);
  const {
    items,
    branchId: cartBranchId,
    addItem,
    increment,
    decrement,
    remove,
    total,
  } = useCart();

  const handleAddToCart = (item: MenuItem) => {
    addItem(branchId, item);
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

          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasMenu = categories.some((category) => category.items.length > 0);
  const isDifferentBranchCart =
    cartBranchId !== null && cartBranchId !== branchId && items.length > 0;

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="flex w-full max-w-5xl gap-6 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Menu
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Browse items for this branch and add them to your order.
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

          {!hasMenu && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              This branch has no visible menu items yet.
            </p>
          )}

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {category.name}
                </h2>

                {category.items.length === 0 && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No items in this category yet.
                  </p>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-700"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-900 dark:text-zinc-50">
                            {item.name}
                          </p>
                          {!item.isAvailable && (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                              Unavailable
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                          {`৳ ${Number(item.basePrice).toFixed(2)}`}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          disabled={!item.isAvailable}
                          onClick={() => handleAddToCart(item)}
                          className="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="w-full max-w-xs space-y-4 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Your cart
          </h2>

          {isDifferentBranchCart && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Your cart currently has items from another branch. Adding items
              from this branch will start a new order here and clear the
              previous branch from your cart.
            </p>
          )}

          {items.length === 0 && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Your cart is empty. Add some items from the menu.
            </p>
          )}

          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((line) => (
                <div
                  key={line.itemId}
                  className="flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {line.name}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {`৳ ${line.basePrice.toFixed(2)} x ${line.quantity}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-1 py-0.5 text-[11px] dark:border-zinc-600">
                      <button
                        type="button"
                        onClick={() => decrement(line.itemId)}
                        className="px-1 text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-zinc-50"
                      >
                        -
                      </button>
                      <span className="min-w-[1.5rem] text-center text-xs text-zinc-800 dark:text-zinc-100">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(line.itemId)}
                        className="px-1 text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-zinc-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.itemId)}
                      className="text-[11px] text-red-600 hover:underline dark:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-3 text-sm dark:border-zinc-700">
                <span className="font-medium text-zinc-800 dark:text-zinc-100">
                  Total
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {`৳ ${total.toFixed(2)}`}
                </span>
              </div>

              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => router.push('/checkout')}
                className="mt-1 w-full rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Proceed to checkout
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
