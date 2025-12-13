import { api } from '@/lib/api';
import type { Address } from '@/types/api';
import type { CreateOrderPayload } from '@/types/orders';

type PromoPreviewRequest = {
  code: string;
  orderSubtotal: number;
  items: {
    itemId: string;
    quantity: number;
    basePrice: number;
  }[];
  branchId?: string | null;
};

type PromoPreviewResponse = {
  discount: number;
  total: number;
  code: string;
};

export function fetchAddresses(token: string) {
  return api.get<Address[]>('/addresses', token);
}

export function previewPromotion(payload: PromoPreviewRequest, token: string) {
  return api.post<PromoPreviewResponse>('/promotions/preview', payload, token);
}

export function createOrder(payload: CreateOrderPayload, token: string) {
  return api.post('/orders', payload, token);
}
