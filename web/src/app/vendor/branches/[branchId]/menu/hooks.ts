'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import type { MenuCategory } from '@/types/api';
import type {
  CategoryFormValues,
  ItemFormValues,
  OptionFormValues,
} from './schemas';
import {
  fetchBranchMenu,
  createMenuCategory,
  createMenuItem,
  createMenuOption,
  deleteMenuCategory,
  deleteMenuItem,
  toggleMenuItemAvailability,
  deleteMenuOption,
} from './services/menu';

export function useBranchMenu(branchId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const cache = useRef<MenuCategory[] | null>(null);

  const loadMenu = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return false;
    }

    setLoading(true);
    try {
      const user = await fetchCurrentUser(token);

      if (user.role !== 'vendor_manager') {
        toast.error('You do not have access to the vendor portal.');
        router.replace('/');
        return false;
      }

      if (cache.current) {
        setCategories(cache.current);
      }

      const data = await fetchBranchMenu(branchId, token);
      setCategories(data ?? []);
      cache.current = data ?? [];
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load branch menu';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [branchId, router]);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  const refreshMenu = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      const data = await fetchBranchMenu(branchId, token);
      const list = data ?? [];
      cache.current = list;
      setCategories(list);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load branch menu';
      toast.error(message);
      return false;
    }
  }, [branchId]);

  const createCategory = async (
    values: CategoryFormValues,
  ): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      await createMenuCategory(branchId, values, token);
      toast.success('Category created.');
      cache.current = null;
      await refreshMenu();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create category';
      toast.error(message);
      return false;
    }
  };

  const createItem = async (values: ItemFormValues): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      await createMenuItem(values, token);

      toast.success('Menu item created.');
      cache.current = null;
      await refreshMenu();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create menu item';
      toast.error(message);
      return false;
    }
  };

  const createOption = async (
    values: OptionFormValues,
  ): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      await createMenuOption(values, token);

      toast.success('Menu option created.');
      cache.current = null;
      await refreshMenu();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create menu option';
      toast.error(message);
      return false;
    }
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      await deleteMenuCategory(categoryId, token);
      toast.success('Category deleted.');
      cache.current = null;
      await refreshMenu();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete category';
      toast.error(message);
      return false;
    }
  };

  const deleteItem = async (itemId: string): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      await deleteMenuItem(itemId, token);
      toast.success('Menu item deleted.');
      cache.current = null;
      await refreshMenu();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete menu item';
      toast.error(message);
      return false;
    }
  };

  const toggleItemAvailability = async (
    itemId: string,
    current: boolean,
  ): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      await toggleMenuItemAvailability(itemId, !current, token);
      toast.success('Item availability updated.');
      cache.current = null;
      await refreshMenu();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update item';
      toast.error(message);
      return false;
    }
  };

  const deleteOption = async (optionId: string): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      await deleteMenuOption(optionId, token);
      toast.success('Menu option deleted.');
      cache.current = null;
      await refreshMenu();
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete menu option';
      toast.error(message);
      return false;
    }
  };

  return {
    loading,
    categories,
    createCategory,
    createItem,
    createOption,
    deleteCategory,
    deleteItem,
    toggleItemAvailability,
    deleteOption,
  };
}
