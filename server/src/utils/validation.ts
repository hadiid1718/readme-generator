/**
 * Validation Schemas
 * Zod schemas for request validation
 */
import { z } from 'zod';

// ---- Auth Schemas ----
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ---- README Schemas ----
export const readmeInputSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  techStack: z.array(z.string()).min(1, 'At least one tech is required'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  installation: z.array(z.string()).default([]),
  usage: z.string().default(''),
  apiDocs: z.string().optional(),
  screenshots: z.array(z.string().url()).default([]),
  githubRepo: z.string().url().optional().or(z.literal('')),
  liveDemo: z.string().url().optional().or(z.literal('')),
  license: z.string().default('MIT'),
  authorName: z.string().min(1, 'Author name is required'),
  authorGithub: z.string().optional(),
  authorEmail: z.string().email().optional().or(z.literal('')),
  authorWebsite: z.string().url().optional().or(z.literal('')),
  customSections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .optional(),
});

export const generateReadmeSchema = z.object({
  input: readmeInputSchema,
  templateId: z.string().default('modern'),
  themeVariant: z.string().default('default'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ReadmeInput = z.infer<typeof readmeInputSchema>;
export type GenerateReadmeInput = z.infer<typeof generateReadmeSchema>;
