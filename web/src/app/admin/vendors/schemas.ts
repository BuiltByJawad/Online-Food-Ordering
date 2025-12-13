import { z } from 'zod';

export const vendorSchema = z.object({
  ownerUserId: z.string().min(1, 'Owner is required'),
  name: z.string().trim().min(1, 'Vendor name is required').max(255, 'Name is too long'),
  brandName: z.string().trim().max(255, 'Brand name is too long').optional().or(z.literal('')),
  legalName: z.string().trim().max(255, 'Legal name is too long').optional().or(z.literal('')),
  taxId: z.string().trim().max(64, 'Tax ID is too long').optional().or(z.literal('')),
  contactEmail: z
    .string()
    .trim()
    .email('Invalid email')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal('')),
  contactPhone: z.string().trim().max(64, 'Phone is too long').optional().or(z.literal('')),
  commissionRate: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 1), {
      message: 'Commission must be between 0 and 1',
    }),
  payoutCycle: z.string().trim().max(64, 'Payout cycle is too long').optional().or(z.literal('')),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
