import { z } from "zod";

export const createMessageSchema = z.object({
  body: z.object({
    content: z
      .string({
        message: "Le contenu doit être une chaîne de caractères.",
      })
      .min(1, "Le contenu du message ne peut pas être vide."),
  }),
});
