'use client';

import { api } from '@/lib/api';
import type { Address } from '@/types/api';
import type { AddressFormValues } from '../schemas';

export function fetchAddresses(token: string) {
  return api.get<Address[]>('/addresses', token);
}

export function createAddress(values: AddressFormValues, token: string) {
  return api.post<Address>(
    '/addresses',
    {
      label: values.label,
      line1: values.line1,
      line2: values.line2 || undefined,
      city: values.city,
      postalCode: values.postalCode || undefined,
      country: values.country,
      lat: values.lat ? Number(values.lat) : undefined,
      lng: values.lng ? Number(values.lng) : undefined,
      isDefault: values.isDefault ?? false,
    },
    token,
  );
}

export function deleteAddress(id: string, token: string) {
  return api.delete<void>(`/addresses/${id}`, token);
}

export function makeDefaultAddress(id: string, token: string) {
  return api.patch<Address>(`/addresses/${id}`, { isDefault: true }, token);
}
