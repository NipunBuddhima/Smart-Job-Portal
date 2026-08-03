import { z } from 'zod';

export const applySchema = z.object({
  coverLetter: z.string().min(20, 'Cover letter should be at least 20 characters').max(1000),
  useProfileResume: z.boolean(),
});

export type ApplyFormValues = z.infer<typeof applySchema>;