import { api } from '@/lib/api';
import type { Promotion } from '../types/promotion';
import type { PromoFormValues } from '../schemas';

export async function fetchPromotions(token: string): Promise<Promotion[]> {
  return api.get<Promotion[]>('/promotions', token);
}

export async function createPromotion(
  values: PromoFormValues,
  token: string,
): Promise<Promotion> {
  return api.post<Promotion>(
    '/promotions',
    {
      code: values.code.trim().toUpperCase(),
      discountType: values.discountType,
      discountValue: values.discountValue,
      maxDiscount: values.maxDiscount,
      maxUses: values.maxUses,
      perUserLimit: values.perUserLimit,
      validFrom: values.validFrom ? new Date(values.validFrom) : undefined,
      validTo: values.validTo ? new Date(values.validTo) : undefined,
      branchId: values.branchId || undefined,
      status: values.status,
    },
    token,
  );
}
