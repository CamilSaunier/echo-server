import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  body: z.object({
    friendId: z.string().uuid("Format d'ID d'ami invalide"),
  }),
});

export const respondFriendRequestSchema = z.object({
  params: z.object({
    friendshipId: z.string().uuid("Format d'ID de demande invalide"),
  }),
  body: z.object({
    accept: z.boolean({ message: "Le champ accept doit être un booléen" }),
  }),
});
