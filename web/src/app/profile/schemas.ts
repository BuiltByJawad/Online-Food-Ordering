import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().max(255, 'Name is too long').optional().or(z.literal('')),
  phone: z.string().max(64, 'Phone is too long').optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
