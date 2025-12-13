import { z } from 'zod';
import type { OrderStatus } from '@/types/orders';

export const riderStatusOptions = [
  'created',
  'accepted',
  'preparing',
  'completed',
  'cancelled',
] as const satisfies OrderStatus[];

export const riderStatusSchema = z.object({
  status: z.enum(riderStatusOptions),
});

export type RiderStatusFormValues = z.infer<typeof riderStatusSchema>;
