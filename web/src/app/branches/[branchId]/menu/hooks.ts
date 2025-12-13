'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MenuCategory } from '@/types/api';

export function useCustomerBranchMenu(branchId: string) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadMenu = async () => {
      try {
        const data = await api.get<MenuCategory[]>(`/branches/${branchId}/menu`);
        if (!isActive) return;
        setCategories(data ?? []);
      } catch {
        if (!isActive) return;
        setCategories([]);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    setLoading(true);
    void loadMenu();

    return () => {
      isActive = false;
    };
  }, [branchId]);

  return { categories, loading };
}
