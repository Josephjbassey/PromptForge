import { z } from 'zod';

export const PromptRewriteRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(5000, "Prompt is too long"),
  audience: z.string().optional(),
  tone: z.string().optional(),
  format: z.string().optional(),
});

export type PromptRewriteRequest = z.infer<typeof PromptRewriteRequestSchema>;

export const PromptRewriteResponseSchema = z.object({
  optimizedPrompt: z.string(),
  explanation: z.string(),
  variables: z.array(z.string()),
});

export type PromptRewriteResponse = z.infer<typeof PromptRewriteResponseSchema>;
