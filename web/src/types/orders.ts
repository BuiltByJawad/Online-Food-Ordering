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

export interface Order {
  id: string;
  items: OrderItemLine[];
  totalAmount: number;
  status: string;
  createdAt: string;
}
