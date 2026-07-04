import { z } from 'zod';

export const CHATBOT_MODEL = 'llama-3.3-70b-versatile';
export const CHATBOT_MAX_MESSAGES = 50;

export const chatRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { message: 'Nội dung chat không được trống' }),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
