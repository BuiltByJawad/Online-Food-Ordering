'use client';

import Link from 'next/link';
import { AddressSelector } from './components/AddressSelector';
import { OrderSummary } from './components/OrderSummary';
import { PromoForm } from './components/PromoForm';
import { useCheckout } from './hooks/useCheckout';

export default function CheckoutPage() {
  const {
    cart,
    promo,
    address,
    state,
    confirmOrder,
    router,
  } = useCheckout();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Checkout
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Review your cart, apply promos, choose delivery, then confirm your order.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <OrderSummary
            items={cart.items}
            subtotal={cart.total}
            promoDiscount={promo.promoDiscount}
            appliedPromoCode={promo.appliedPromoCode}
            finalTotal={state.finalTotal}
            error={state.error}
            placed={state.placed}
            hasItems={state.hasItems}
            onClear={cart.clear}
            onViewOrders={() => router.push('/orders')}
          />

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700">
            <PromoForm
              disabled={!state.hasItems}
              applying={promo.promoApplying}
              appliedPromoCode={promo.appliedPromoCode}
              error={promo.promoError}
              onApply={promo.applyPromo}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  Delivery address
                </span>
              </div>
              <AddressSelector
                addresses={address.addresses}
                loading={address.addressLoading}
                authRequired={address.addressAuthRequired}
                error={address.addressError}
                selectedAddressId={address.selectedAddressId}
                onSelect={address.setSelectedAddressId}
                onManage={() => router.push('/profile/addresses')}
                onSignIn={() => router.push('/auth/login')}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800 md:w-auto"
          >
            Back home
          </Link>

          <div className="flex flex-1 flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
            {!state.canConfirm && state.hasItems && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 md:text-right">
                {state.loginRequired
                  ? 'Sign in to place your order.'
                  : state.addressRequired && !state.hasSelectedAddress
                  ? 'Select a delivery address to place your order.'
                  : 'Unable to place order right now.'}
              </p>
            )}
            <button
              type="button"
              disabled={!state.canConfirm}
              onClick={confirmOrder}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 md:w-auto"
            >
              {state.submitting
                ? 'Placing order...'
                : state.placed
                ? 'Order placed'
                : 'Confirm order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
