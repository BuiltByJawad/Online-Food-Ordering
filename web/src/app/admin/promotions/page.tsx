'use client';

import { ActivePromotionsList } from './components/ActivePromotionsList';
import { PromotionForm } from './components/PromotionForm';
import { usePromotions } from './hooks/usePromotions';

export default function AdminPromotionsPage() {
  const { activePromos, loading, error, creating, createPromotion } =
    usePromotions();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Promotions
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Create and monitor promo codes with caps, limits, and branch scopes.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PromotionForm
          submitting={creating}
          error={error}
          onSubmit={createPromotion}
        />

        <ActivePromotionsList
          loading={loading}
          activePromos={activePromos}
        />
      </div>
    </div>
  );
}
