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

export interface Order {
  id: string;
  items: OrderItemLine[];
  totalAmount: number;
  status: string;
  createdAt: string;
  branchId?: string | null;
  deliveryAddress?: OrderDeliveryAddressSnapshot | null;
}

export interface CreateOrderPayload {
  items: OrderItemInput[];
  branchId?: string | null;
  addressId?: string | null;
}
