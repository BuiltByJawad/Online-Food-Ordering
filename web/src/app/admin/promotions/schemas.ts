import { z } from 'zod';

export const promoSchema = z.object({
  code: z.string().trim().min(1, 'Code is required').max(32),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().positive('Value must be greater than 0'),
  maxDiscount: z.coerce.number().nonnegative().optional(),
  maxUses: z.coerce.number().nonnegative().optional(),
  perUserLimit: z.coerce.number().nonnegative().optional(),
  validFrom: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v : undefined)),
  validTo: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v : undefined)),
  branchId: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v : undefined)),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type PromoFormValues = z.infer<typeof promoSchema>;
