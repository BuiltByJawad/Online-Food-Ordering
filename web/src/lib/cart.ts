'use client';

import { useEffect, useState } from 'react';
import type { MenuItem } from '@/types/api';

export interface CartLine {
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
}

const CART_STORAGE_KEY = 'customer-cart';

function loadCartFromStorage(): CartLine[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as CartLine[];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartLine[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Swallow storage errors to avoid breaking the UI.
  }
}

export function useCart() {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    setItems(loadCartFromStorage());
  }, []);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = (item: MenuItem) => {
    const basePrice = Number(item.basePrice);

    setItems((prev) => {
      const existing = prev.find((line) => line.itemId === item.id);
      if (existing) {
        return prev.map((line) =>
          line.itemId === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }

      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          basePrice,
          quantity: 1,
        },
      ];
    });
  };

  const increment = (itemId: string) => {
    setItems((prev) =>
      prev.map((line) =>
        line.itemId === itemId
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      ),
    );
  };

  const decrement = (itemId: string) => {
    setItems((prev) =>
      prev
        .map((line) =>
          line.itemId === itemId
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const remove = (itemId: string) => {
    setItems((prev) => prev.filter((line) => line.itemId !== itemId));
  };

  const clear = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, line) => sum + line.basePrice * line.quantity,
    0,
  );

  return { items, addItem, increment, decrement, remove, clear, total };
}
