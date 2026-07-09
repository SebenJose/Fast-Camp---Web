import { z } from "zod";

export const CHAT_MESSAGE_MAX_LENGTH = 2000;

export const chatMessageRoleSchema = z.enum(["user", "assistant"]);

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  role: chatMessageRoleSchema,
  content: z.string().min(1),
  createdAt: z.string(),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
});

export const chatApiResponseSchema = z.object({
  message: z.string().nullish(),
  messages: z.array(chatMessageSchema).nullish(),
});

export const chatInputSchema = z
  .string()
  .trim()
  .min(1)
  .max(CHAT_MESSAGE_MAX_LENGTH);

export type ChatMessageRole = z.infer<typeof chatMessageRoleSchema>;
export type ChatApiMessage = z.infer<typeof chatMessageSchema>;
export type ChatApiResponse = z.infer<typeof chatApiResponseSchema>;
