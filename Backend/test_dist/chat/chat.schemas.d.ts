import { z } from 'zod';
export declare const CHATBOT_MODEL = "llama-3.3-70b-versatile";
export declare const CHATBOT_MAX_MESSAGES = 50;
export declare const chatRequestSchema: z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
