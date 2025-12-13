'use client';

import { io, Socket } from 'socket.io-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'http://localhost:3000';
  }
})();

export type OrdersSocket = Socket<{
  'order.status.updated': (data: OrderStatusUpdatedEvent) => void;
  'order.rider.assigned': (data: OrderRiderAssignedEvent) => void;
}>;

export interface OrderStatusUpdatedEvent {
  orderId: string;
  status: string;
  riderId: string | null;
}

export interface OrderRiderAssignedEvent {
  orderId: string;
  riderId: string | null;
}

export function createOrdersSocket(token: string): OrdersSocket {
  return io(`${API_ORIGIN}/orders`, {
    transports: ['websocket'],
    auth: { token },
    extraHeaders: { Authorization: `Bearer ${token}` },
  });
}
