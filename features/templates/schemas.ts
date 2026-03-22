import { z } from 'zod';

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  variables: z.array(z.string()),
  createdAt: z.string(),
});

export type Template = z.infer<typeof TemplateSchema>;
