import { z } from "zod";

export const createMessageValidator = z.object({
  body: z.object({
    content: z
      .string({
        message: "Content must be a string.",
      })
      .min(1, "Message content cannot be empty."),
  }),
});
