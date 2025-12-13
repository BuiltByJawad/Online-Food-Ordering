import { api } from '@/lib/api';
import type { MenuCategory } from '@/types/api';
import type {
  CategoryFormValues,
  ItemFormValues,
  OptionFormValues,
} from '../schemas';

export function fetchBranchMenu(branchId: string, token: string) {
  return api.get<MenuCategory[]>(`/branches/${branchId}/menu`, token);
}

export function createMenuCategory(branchId: string, values: CategoryFormValues, token: string) {
  return api.post<MenuCategory>(
    `/branches/${branchId}/menu-categories`,
    {
      name: values.name,
      sortOrder: values.sortOrder ? Number(values.sortOrder) : undefined,
    },
    token,
  );
}

export function createMenuItem(values: ItemFormValues, token: string) {
  return api.post(
    `/menu-categories/${values.categoryId}/items`,
    {
      name: values.name,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
      basePrice: Number(values.basePrice),
      taxCategory: values.taxCategory || undefined,
      isAvailable: values.isAvailable ?? true,
    },
    token,
  );
}

export function createMenuOption(values: OptionFormValues, token: string) {
  return api.post(
    `/menu-items/${values.itemId}/options`,
    {
      type: values.type,
      name: values.name,
      priceDelta: values.priceDelta ? Number(values.priceDelta) : 0,
      isRequired: values.isRequired ?? false,
      maxSelection: values.maxSelection ? Number(values.maxSelection) : undefined,
    },
    token,
  );
}

export function deleteMenuCategory(categoryId: string, token: string) {
  return api.delete<void>(`/menu-categories/${categoryId}`, token);
}

export function deleteMenuItem(itemId: string, token: string) {
  return api.delete<void>(`/menu-items/${itemId}`, token);
}

export function toggleMenuItemAvailability(itemId: string, isAvailable: boolean, token: string) {
  return api.patch<void>(`/menu-items/${itemId}`, { isAvailable }, token);
}

export function deleteMenuOption(optionId: string, token: string) {
  return api.delete<void>(`/menu-options/${optionId}`, token);
}
