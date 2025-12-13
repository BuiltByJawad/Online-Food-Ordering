'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ensureAdmin } from '../../auth';
import { getAccessToken } from '@/lib/auth';
import {
  createPromotion as createPromotionService,
  fetchPromotions,
} from '../services/promotions';
import type { PromoFormValues } from '../schemas';
import type { Promotion } from '../types/promotion';

let promotionsCache: Promotion[] | null = null;

export function usePromotions() {
  const router = useRouter();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheInitialized = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    if (promotionsCache && !cacheInitialized.current) {
      setPromos(promotionsCache);
      cacheInitialized.current = true;
    }
    setLoading(true);
    try {
      const ctx = await ensureAdmin(router);
      if (!ctx) return;
      const token = ctx.token;
      const data = await fetchPromotions(token);
      setPromos(data ?? []);
      promotionsCache = data ?? [];
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load promotions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const createPromotion = useCallback(
    async (values: PromoFormValues) => {
      const token = getAccessToken();
      if (!token) {
        toast.error('You are not logged in.');
        router.replace('/auth/login');
        return false;
      }
      setCreating(true);
      try {
        await createPromotionService(values, token);
        toast.success('Promotion created.');
        promotionsCache = null;
        await load();
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to create promotion';
        toast.error(message);
        setError(message);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [load, router],
  );

  const activePromos = useMemo(
    () => promos.filter((p) => p.status === 'active'),
    [promos],
  );

  return { promos, activePromos, loading, creating, error, createPromotion };
}
