'use client';

import { api } from '@/lib/api';
import type { VendorFormValues } from '../schemas';
import type { AdminVendor } from '../types/vendor';

export async function fetchVendors(token: string): Promise<AdminVendor[]> {
  return api.get<AdminVendor[]>('/vendors', token);
}

export async function createVendor(
  payload: VendorFormValues,
  token: string,
): Promise<AdminVendor> {
  const commissionRate =
    payload.commissionRate && payload.commissionRate.trim().length
      ? Number(payload.commissionRate)
      : undefined;

  return api.post<AdminVendor>(
    '/vendors',
    {
      ownerUserId: payload.ownerUserId,
      name: payload.name.trim(),
      brandName: payload.brandName?.trim() || undefined,
      legalName: payload.legalName?.trim() || undefined,
      taxId: payload.taxId?.trim() || undefined,
      contactEmail: payload.contactEmail?.trim() || undefined,
      contactPhone: payload.contactPhone?.trim() || undefined,
      commissionRate: Number.isNaN(commissionRate) ? undefined : commissionRate,
      payoutCycle: payload.payoutCycle?.trim() || undefined,
    },
    token,
  );
}
