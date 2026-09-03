import { z } from "zod";

export const createMessageValidator = z.object({
  body: z.object({
    content: z
      .string({
        message: "le contenue doit être une chaine de caractère",
      })
      .min(1, "Le message ne peux pas être vide"),
  }),
});
