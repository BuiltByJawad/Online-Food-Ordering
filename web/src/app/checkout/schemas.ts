import { z } from 'zod';

export const promoSchema = z.object({
  code: z.string().trim().min(1, 'Code is required').max(32),
});

export type PromoFormValues = z.infer<typeof promoSchema>;
