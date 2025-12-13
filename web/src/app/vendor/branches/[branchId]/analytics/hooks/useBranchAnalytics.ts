'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import type { BranchAnalytics } from '@/types/orders';
import { fetchBranchAnalytics, fetchBranchInfo } from '../services/analytics';

type UseBranchAnalyticsResult = {
  loading: boolean;
  branchLabel: string | null;
  analytics: BranchAnalytics | null;
  dayWindow: number;
  setDayWindow: (days: number) => void;
  refresh: () => Promise<void>;
};

export function useBranchAnalytics(branchId: string): UseBranchAnalyticsResult {
  const [loading, setLoading] = useState(true);
  const [branchLabel, setBranchLabel] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<BranchAnalytics | null>(null);
  const [dayWindow, setDayWindow] = useState<number>(7);

  const cache = useRef<Record<number, BranchAnalytics | null>>({});
  const labelLoaded = useRef(false);

  const load = useCallback(
    async (days: number) => {
      const token = getAccessToken();

      if (!token) {
        toast.error('You are not logged in.');
        return;
      }

      setLoading(true);

      try {
        const user = await fetchCurrentUser(token);
        if (user.role !== 'vendor_manager' && user.role !== 'admin') {
          toast.error('You do not have access to the vendor portal.');
          return;
        }

        if (!labelLoaded.current) {
          const info = await fetchBranchInfo(branchId, token);
          if (info) {
            const vendorPrefix =
              info.vendorName && info.vendorName !== info.name ? `${info.vendorName} - ` : '';
            const citySuffix = info.city ? ` (${info.city})` : '';
            setBranchLabel(`${vendorPrefix}${info.name}${citySuffix}`);
          }
          labelLoaded.current = true;
        }

        if (cache.current[days] !== undefined) {
          setAnalytics(cache.current[days] ?? null);
        }

        const data = await fetchBranchAnalytics(branchId, days, token);
        cache.current[days] = data ?? null;
        setAnalytics(data ?? null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load analytics';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [branchId],
  );

  useEffect(() => {
    void load(dayWindow);
  }, [dayWindow, load]);

  const refresh = useCallback(async () => {
    await load(dayWindow);
  }, [dayWindow, load]);

  return {
    loading,
    branchLabel,
    analytics,
    dayWindow,
    setDayWindow,
    refresh,
  };
}
