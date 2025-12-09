'use client';

import { useEffect, useState } from 'react';
import type { MenuItem } from '@/types/api';

export interface CartLine {
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
}

interface CartState {
  branchId: string | null;
  items: CartLine[];
}

const CART_STORAGE_KEY = 'customer-cart';

function loadCartFromStorage(): CartState {
  if (typeof window === 'undefined') {
    return { branchId: null, items: [] };
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return { branchId: null, items: [] };
    }

    const parsed = JSON.parse(raw);

    // Backwards compatibility: old format was an array of CartLine.
    if (Array.isArray(parsed)) {
      return {
        branchId: null,
        items: parsed as CartLine[],
      };
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as any).items)
    ) {
      return {
        branchId:
          typeof (parsed as any).branchId === 'string'
            ? (parsed as any).branchId
            : null,
        items: (parsed as any).items as CartLine[],
      };
    }

    return { branchId: null, items: [] };
  } catch {
    return { branchId: null, items: [] };
  }
}

function saveCartToStorage(state: CartState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Swallow storage errors to avoid breaking the UI.
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartState>({ branchId: null, items: [] });

  useEffect(() => {
    setCart(loadCartFromStorage());
  }, []);

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addItem = (branchId: string, item: MenuItem) => {
    const basePrice = Number(item.basePrice);

    setCart((prev) => {
      const switchingBranch =
        prev.branchId !== null && prev.branchId !== branchId;

      const baseItems = switchingBranch ? [] : prev.items;

      const existing = baseItems.find((line) => line.itemId === item.id);
      let nextItems: CartLine[];

      if (existing) {
        nextItems = baseItems.map((line) =>
          line.itemId === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      } else {
        nextItems = [
          ...baseItems,
          {
            itemId: item.id,
            name: item.name,
            basePrice,
            quantity: 1,
          },
        ];
      }

      return {
        branchId,
        items: nextItems,
      };
    });
  };

  const increment = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((line) =>
        line.itemId === itemId
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      ),
    }));
  };

  const decrement = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items
        .map((line) =>
          line.itemId === itemId
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        )
        .filter((line) => line.quantity > 0),
    }));
  };

  const remove = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((line) => line.itemId !== itemId),
    }));
  };

  const clear = () => {
    setCart({ branchId: null, items: [] });
  };

  const total = cart.items.reduce(
    (sum, line) => sum + line.basePrice * line.quantity,
    0,
  );

  return {
    items: cart.items,
    branchId: cart.branchId,
    addItem,
    increment,
    decrement,
    remove,
    clear,
    total,
  };
}
