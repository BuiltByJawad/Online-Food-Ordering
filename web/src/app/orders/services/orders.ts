import { api } from '@/lib/api';
import type { Order } from '@/types/orders';
import type { Review } from '@/types/reviews';
import type { ReviewFormValues } from '../schemas';

export type BranchPublicInfo = {
  id: string;
  name: string;
  city: string;
  country: string;
  vendorName: string | null;
};

export function fetchOrders(token: string): Promise<Order[]> {
  return api.get<Order[]>('/orders', token);
}

export function fetchBranchInfo(id: string): Promise<BranchPublicInfo> {
  return api.get<BranchPublicInfo>(`/branches/${id}/info`);
}

export function fetchOrderReview(id: string, token: string): Promise<Review | null> {
  return api.get<Review | null>(`/reviews/order/${id}`, token);
}

export function submitReview(
  payload: { orderId: string } & ReviewFormValues,
  token: string,
): Promise<Review> {
  return api.post<Review>('/reviews', payload, token);
}
