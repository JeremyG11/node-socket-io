import { object, z } from "zod";

export const sendMessageSchema = object({
  body: object({
    message: z.string({
      required_error: "ConversationId is required",
    }),
  }),
  query: object({
    receiverId: z.string({
      required_error: "receiverId is required",
    }),
  }),
});

export const conversationSchema = object({
  query: object({
    receiverId: z.string({
      required_error: "receiverId is required",
    }),
  }),
});

export type ZodMessageSchema = z.infer<typeof sendMessageSchema>;
export type ZodConversationSchema = z.infer<typeof conversationSchema>;
