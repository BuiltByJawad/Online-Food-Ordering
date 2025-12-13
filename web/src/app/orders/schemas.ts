import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z
    .coerce.number()
    .int()
    .min(1, 'Please select a rating')
    .max(5, 'Maximum rating is 5'),
  comment: z
    .string()
    .max(1000, 'Comment is too long')
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
