'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart';
import { getAccessToken } from '@/lib/auth';
import type { Address } from '@/types/api';
import type { CreateOrderPayload } from '@/types/orders';
import { fetchAddresses, previewPromotion, createOrder } from '../services/checkout';
import type { PromoFormValues } from '../schemas';

type CartLine = {
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
};

export function useCheckout() {
  const router = useRouter();
  const { items, total, branchId, clear } = useCart();

  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressAuthRequired, setAddressAuthRequired] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const addressesCache = useRef<Address[] | null>(null);

  const hasItems = items.length > 0;
  const loginRequired = addressAuthRequired;
  const addressRequired = !loginRequired && addresses.length > 0;
  const hasSelectedAddress = !!selectedAddressId;
  const canConfirm =
    hasItems && !submitting && !loginRequired && (!addressRequired || hasSelectedAddress);
  const finalTotal = useMemo(() => Math.max(total - promoDiscount, 0), [total, promoDiscount]);

  useEffect(() => {
    // reset promo if cart changes
    setPromoDiscount(0);
    setAppliedPromoCode(null);
    setPromoError(null);
  }, [items]);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setAddressAuthRequired(true);
      setAddressLoading(false);
      return;
    }

    if (addressesCache.current) {
      setAddresses(addressesCache.current);
      const list = addressesCache.current;
      if (list.length > 0) {
        const def = list.find((a) => a.isDefault) ?? list[0];
        setSelectedAddressId(def.id);
      }
      setAddressLoading(false);
      return;
    }

    setAddressLoading(true);
    setAddressError(null);

    fetchAddresses(token)
      .then((data) => {
        const list = data ?? [];
        addressesCache.current = list;
        setAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) ?? list[0];
          setSelectedAddressId(def.id);
        } else {
          setSelectedAddressId(null);
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load addresses';
        setAddressError(message);
      })
      .finally(() => {
        setAddressLoading(false);
      });
  }, []);

  const applyPromo = async (values: PromoFormValues) => {
    if (!hasItems) {
      setPromoError('Add items to your cart first.');
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setPromoError('Please sign in to apply a promo code.');
      router.push('/auth/login');
      return;
    }

    setPromoApplying(true);
    setPromoError(null);
    try {
      const res = await previewPromotion(
        {
          code: values.code.trim().toUpperCase(),
          orderSubtotal: total,
          items: items.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            basePrice: line.basePrice,
          })),
          ...(branchId ? { branchId } : {}),
        },
        token,
      );
      setPromoDiscount(res.discount);
      setAppliedPromoCode(res.code);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to apply promo code';
      setPromoError(message);
      setPromoDiscount(0);
      setAppliedPromoCode(null);
    } finally {
      setPromoApplying(false);
    }
  };

  const confirmOrder = async () => {
    if (!hasItems || submitting) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Please sign in to place an order.');
      router.push('/auth/login');
      return;
    }

    if (addressRequired && !selectedAddressId) {
      setError('Please select a delivery address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreateOrderPayload = {
        items: items.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
        ...(branchId ? { branchId } : {}),
        ...(selectedAddressId ? { addressId: selectedAddressId } : {}),
        ...(appliedPromoCode ? { promoCode: appliedPromoCode } : {}),
      };

      await createOrder(payload, token);

      clear();
      setPlaced(true);
      toast.success('Order placed.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to place order';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cart: { items: items as CartLine[], total, branchId, clear },
    promo: {
      promoDiscount,
      appliedPromoCode,
      promoApplying,
      promoError,
      applyPromo,
    },
    address: {
      addresses,
      addressLoading,
      addressError,
      addressAuthRequired,
      selectedAddressId,
      setSelectedAddressId,
    },
    state: {
      placed,
      submitting,
      error,
      hasItems,
      loginRequired,
      addressRequired,
      hasSelectedAddress,
      canConfirm,
      finalTotal,
    },
    confirmOrder,
    router,
  };
}
