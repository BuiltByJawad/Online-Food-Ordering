import { api } from '@/lib/api';
import type { Vendor, Branch } from '@/types/api';
import type { BranchFormValues } from '../schemas';

export async function fetchVendorProfile(token: string): Promise<Vendor> {
  return api.get<Vendor>('/vendors/me', token);
}

export async function fetchVendorBranches(vendorId: string, token: string): Promise<Branch[]> {
  return api.get<Branch[]>(`/vendors/${vendorId}/branches`, token);
}

export async function createVendorBranch(
  vendorId: string,
  values: BranchFormValues,
  token: string,
): Promise<Branch> {
  return api.post<Branch>(
    `/vendors/${vendorId}/branches`,
    {
      name: values.name,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      city: values.city,
      postalCode: values.postalCode || undefined,
      country: values.country,
      lat: values.lat ? Number(values.lat) : undefined,
      lng: values.lng ? Number(values.lng) : undefined,
    },
    token,
  );
}

export async function updateVendorBranch(
  vendorId: string,
  branchId: string,
  values: BranchFormValues,
  token: string,
): Promise<Branch> {
  return api.patch<Branch>(
    `/vendors/${vendorId}/branches/${branchId}`,
    {
      name: values.name,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      city: values.city,
      postalCode: values.postalCode || undefined,
      country: values.country,
      lat: values.lat ? Number(values.lat) : undefined,
      lng: values.lng ? Number(values.lng) : undefined,
      status: values.status,
    },
    token,
  );
}

export async function deleteVendorBranch(
  vendorId: string,
  branchId: string,
  token: string,
): Promise<void> {
  return api.delete<void>(`/vendors/${vendorId}/branches/${branchId}`, token);
}
