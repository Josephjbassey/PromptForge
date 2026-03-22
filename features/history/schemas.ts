import { z } from 'zod';

export const HistoryItemSchema = z.object({
  id: z.string(),
  type: z.enum(['engineer', 'playground']),
  prompt: z.string(),
  result: z.string().optional(),
  createdAt: z.string(),
});

export type HistoryItem = z.infer<typeof HistoryItemSchema>;
