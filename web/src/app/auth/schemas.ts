import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must be at most 64 characters long'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must be at most 64 characters long'),
  name: z.string().max(255, 'Name is too long').optional().or(z.literal('')),
  phone: z.string().max(32, 'Phone is too long').optional().or(z.literal('')),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
