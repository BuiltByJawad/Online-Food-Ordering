'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import type { MenuCategory } from '@/types/api';
import type {
  CategoryFormValues,
  ItemFormValues,
  OptionFormValues,
} from './schemas';

export function useBranchMenu(branchId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  useEffect(() => {
    const loadMenu = async () => {
      const token = getAccessToken();

      if (!token) {
        toast.error('You are not logged in.');
        router.replace('/auth/login');
        return;
      }

      try {
        const user = await fetchCurrentUser(token);

        if (user.role !== 'vendor_manager') {
          toast.error('You do not have access to the vendor portal.');
          router.replace('/');
          return;
        }

        const data = await api.get<MenuCategory[]>(
          `/branches/${branchId}/menu`,
          token,
        );
        setCategories(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load branch menu';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [branchId, router]);

  const refreshMenu = async () => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    try {
      const data = await api.get<MenuCategory[]>(
        `/branches/${branchId}/menu`,
        token,
      );
      setCategories(data);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load branch menu';
      toast.error(message);
      return false;
    }
  };

  const createCategory = async (
    values: CategoryFormValues,
  ): Promise<boolean> => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return false;
    }

    const sortOrder = values.sortOrder ? Number(values.sortOrder) : undefined;

    try {
      await api.post(
        `/branches/${branchId}/menu-categories`,
        {
          name: values.name,
          sortOrder,
        },
        token,
      );

      toast.success('Category created.');
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

    const basePrice = Number(values.basePrice);

    try {
      await api.post(
        `/menu-categories/${values.categoryId}/items`,
        {
          name: values.name,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          basePrice,
          taxCategory: values.taxCategory || undefined,
          isAvailable: values.isAvailable ?? true,
        },
        token,
      );

      toast.success('Menu item created.');
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

    const priceDelta = values.priceDelta ? Number(values.priceDelta) : 0;
    const maxSelection = values.maxSelection
      ? Number(values.maxSelection)
      : undefined;

    try {
      await api.post(
        `/menu-items/${values.itemId}/options`,
        {
          type: values.type,
          name: values.name,
          priceDelta,
          isRequired: values.isRequired ?? false,
          maxSelection,
        },
        token,
      );

      toast.success('Menu option created.');
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
      await api.delete(`/menu-categories/${categoryId}`, token);
      toast.success('Category deleted.');
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
      await api.delete(`/menu-items/${itemId}`, token);
      toast.success('Menu item deleted.');
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
      await api.patch(
        `/menu-items/${itemId}`,
        { isAvailable: !current },
        token,
      );
      toast.success('Item availability updated.');
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
      await api.delete(`/menu-options/${optionId}`, token);
      toast.success('Menu option deleted.');
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
