import { api } from '@/lib/api';
import type { Order, OrderStatus } from '@/types/orders';

export function fetchRiderOrders(token: string) {
  return api.get<Order[]>('/orders/rider', token);
}

export function updateRiderOrderStatus(orderId: string, status: OrderStatus, token: string) {
  return api.patch<Order>(`/orders/${orderId}/rider-status`, { status }, token);
}
