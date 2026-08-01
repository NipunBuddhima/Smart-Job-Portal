import { z } from 'zod';

const optionalUrl = z.string().url('Must be a valid URL').or(z.literal('')).optional();

const candidateEducationSchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

const candidateExperienceSchema = z.object({
  company: z.string().min(2, 'Company is required'),
  title: z.string().min(2, 'Title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

const socialLinksSchema = z.object({
  linkedin: optionalUrl,
  github: optionalUrl,
  portfolio: optionalUrl,
});

export const candidateProfileSchema = z.object({
  skillsText: z.string().min(2, 'Add at least one skill'),
  education: z.array(candidateEducationSchema).min(1, 'Add at least one education entry'),
  experience: z.array(candidateExperienceSchema).min(1, 'Add at least one experience entry'),
  socialLinks: socialLinksSchema,
});

export const employerProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyDescription: z.string().min(20, 'Describe the company with at least 20 characters'),
  website: z.string().url('Website must be a valid URL'),
});

export type CandidateProfileFormValues = z.infer<typeof candidateProfileSchema>;
export type EmployerProfileFormValues = z.infer<typeof employerProfileSchema>;