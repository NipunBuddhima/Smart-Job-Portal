import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Provide a detailed description'),
  requirements: z.string().min(5, 'List at least one requirement'), // Will split into array on submit
  location: z.string().min(2, 'Location is required'),
  jobType: z.enum(['Remote', 'On-site', 'Hybrid']),
  status: z.enum(['draft', 'published', 'closed']).default('published'),
  tagsText: z.string().optional(),
  salaryMin: z.coerce.number().min(0, 'Must be positive'),
  salaryMax: z.coerce.number().min(0, 'Must be positive'),
}).refine((data) => data.salaryMax >= data.salaryMin, {
  message: "Max salary must be greater than or equal to Min salary",
  path: ["salaryMax"],
});

export type JobFormValues = z.input<typeof jobSchema>;