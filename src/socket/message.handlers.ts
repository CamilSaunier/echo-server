// src/socket/message.handlers.ts
import { Server, Socket } from "socket.io";
import { MessageClient } from "../clients/message.client";

// Instanciation du client métier pour dialoguer avec la base de données (Prisma)
const messageClient = new MessageClient();

/**
 * Registers all message-related event listeners for a given socket client.
 * @param io - The global Socket.io server instance (to broadcast to everyone)
 * @param socket - The individual and unique connection of the newly connected client
 */
export const registerMessageHandlers = (io: Server, socket: Socket) => {
  // Écoute de l'événement déclenché par le front-end lorsqu'un utilisateur envoie un message
  socket.on("message:send", async (data: { content: string; userId: string; conversationId: string }) => {
    try {
      const { content, conversationId } = data;

      // On récupère l'ID de l'utilisateur authentifié via le token JWT
      const userId = socket.data.userId;

      // 1. Persistance : On passe par notre client pour enregistrer le message en BDD avec ses relations
      const newMessage = await messageClient.createMessage(content, userId, conversationId);

      // 2. Diffusion (Broadcast) : On envoie le nouveau message validé à TOUS les clients connectés
      io.emit("message:received", newMessage);
    } catch (error: any) {
      // 3. Gestion des erreurs : Si la validation ou l'insertion échoue,
      // on prévient UNIQUEMENT l'expéditeur via son socket individuel
      socket.emit("error", {
        message: error.message || "Erreur lors de l'envoi du message.",
      });
    }
  });
};
