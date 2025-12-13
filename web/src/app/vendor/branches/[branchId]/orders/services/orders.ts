import { api } from '@/lib/api';
import type { Order, OrderStatus } from '@/types/orders';
import type { User } from '@/types/api';

export type BranchPublicInfo = {
  id: string;
  name: string;
  city: string;
  country: string;
  vendorName: string | null;
};

export function fetchBranchOrders(branchId: string, token: string) {
  return api.get<Order[]>(`/orders/branch/${branchId}`, token);
}

export function updateBranchOrderStatus(orderId: string, status: OrderStatus, token: string) {
  return api.patch<Order>(`/orders/${orderId}/status`, { status }, token);
}

export function assignBranchOrderRider(orderId: string, riderUserId: string, token: string) {
  return api.patch<Order>(`/orders/${orderId}/assign-rider`, { riderUserId }, token);
}

export function searchRiders(query: string, token: string) {
  const url = query.length ? `/users/riders?q=${encodeURIComponent(query)}` : '/users/riders';
  return api.get<User[]>(url, token);
}

export function fetchBranchInfo(branchId: string, token?: string) {
  return api.get<BranchPublicInfo>(`/branches/${branchId}/info`, token);
}
