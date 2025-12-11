import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long'),
  sortOrder: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Number(val)),
      'Sort order must be a number',
    ),
});

export const itemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long'),
  description: z
    .string()
    .max(2000, 'Description is too long')
    .optional()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .url('Please enter a valid image URL')
    .optional()
    .or(z.literal('')),
  basePrice: z
    .string()
    .min(1, 'Base price is required')
    .refine(
      (val) => !Number.isNaN(Number(val)),
      'Base price must be a number',
    ),
  taxCategory: z
    .string()
    .max(64, 'Tax category is too long')
    .optional()
    .or(z.literal('')),
  isAvailable: z.boolean().optional(),
});

export const optionSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  type: z
    .string()
    .min(1, 'Type is required')
    .max(32, 'Type is too long'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long'),
  priceDelta: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Number(val)),
      'Price difference must be a number',
    ),
  isRequired: z.boolean().optional(),
  maxSelection: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Number(val)),
      'Max selection must be a number',
    ),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;
export type OptionFormValues = z.infer<typeof optionSchema>;
