import { z } from 'zod';

export const PlaygroundRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  systemInstruction: z.string().optional(),
  temperature: z.number().min(0).max(2),
});

export type PlaygroundRequest = z.infer<typeof PlaygroundRequestSchema>;

export const PlaygroundResponseSchema = z.object({
  text: z.string(),
  usage: z.object({
    promptTokenCount: z.number().optional(),
    candidatesTokenCount: z.number().optional(),
    totalTokenCount: z.number().optional(),
  }).optional(),
});

export type PlaygroundResponse = z.infer<typeof PlaygroundResponseSchema>;
