'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MenuCategory } from '@/types/api';

export function useCustomerBranchMenu(branchId: string) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    api
      .get<MenuCategory[]>(`/branches/${branchId}/menu`)
      .then((data) => {
        if (!isActive) return;
        setCategories(data);
      })
      .catch(() => {
        if (!isActive) return;
        setCategories([]);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [branchId]);

  return { categories, loading };
}
