import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().max(255, 'Name is too long').optional().or(z.literal('')),
  phone: z.string().max(32, 'Phone is too long').optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(64, 'Label is too long'),
  line1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 is too long'),
  line2: z
    .string()
    .max(255, 'Address line 2 is too long')
    .optional()
    .or(z.literal('')),
  city: z.string().min(1, 'City is required').max(128, 'City is too long'),
  postalCode: z
    .string()
    .max(32, 'Postal code is too long')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(64, 'Country is too long'),
  lat: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Number(val)),
      'Latitude must be a number',
    ),
  lng: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Number(val)),
      'Longitude must be a number',
    ),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
