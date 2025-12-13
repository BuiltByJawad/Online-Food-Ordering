export interface Review {
  id: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
