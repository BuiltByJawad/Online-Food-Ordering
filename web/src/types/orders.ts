export interface OrderItemInput {
  itemId: string;
  quantity: number;
}

export interface OrderItemLine {
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
}

export interface OrderDeliveryAddressSnapshot {
  addressId: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  postalCode?: string | null;
  country: string;
}

export type OrderStatus =
  | 'created'
  | 'accepted'
  | 'preparing'
  | 'completed'
  | 'cancelled';

export interface OrderRider {
  id: string;
  email?: string;
  name?: string;
}

export interface Order {
  id: string;
  items: OrderItemLine[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  branchId?: string | null;
  deliveryAddress?: OrderDeliveryAddressSnapshot | null;
  rider?: OrderRider | null;
}

export interface CreateOrderPayload {
  items: OrderItemInput[];
  branchId?: string | null;
  addressId?: string | null;
}

export interface BranchAnalytics {
  ordersPerDay: Array<{ date: string; count: number }>;
  revenuePerDay: Array<{ date: string; total: number }>;
  topItems: Array<{ name: string; quantity: number; amount: number }>;
}
