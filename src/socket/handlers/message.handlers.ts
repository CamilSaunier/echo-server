// src/socket/handlers/message.handlers.ts
import { Server, Socket } from "socket.io";
import { MessageClient } from "../../clients/message.client";
import { ConversationClient } from "../../clients/conversation.client";

const messageClient = new MessageClient();
const conversationClient = new ConversationClient();

/**
 * Registers message-related WebSocket event listeners for an authenticated socket client.
 *
 * @param {Server} io - The global Socket.io server instance
 * @param {Socket} socket - The individual socket connection
 */
export const registerMessageHandlers = (io: Server, socket: Socket) => {
  /**
   * Listens for incoming messages sent by a client.
   * Validates membership, persists to database, and broadcasts to the target room.
   */
  socket.on("message:send", async (data: { content: string; conversationId: string }) => {
    try {
      const { content, conversationId } = data;
      // On récupère l'ID utilisateur injecté de manière sécurisée par le middleware de handshake
      const userId = socket.data.userId;

      // 1. Sécurité : Vérification que l'utilisateur fait bien partie de la conversation
      await conversationClient.verifyUserAccess(userId, conversationId);

      // 2. Persistance : Enregistrement du message en base de données
      const newMessage = await messageClient.createMessage(content, userId, conversationId);

      // 3. Diffusion ciblée : On émet le message UNIQUEMENT aux membres de la room
      io.to(conversationId).emit("message:received", newMessage);
    } catch (error: any) {
      // Gestion d'erreur : Notification individuelle à l'expéditeur uniquement
      socket.emit("error", {
        message: error.message || "Erreur lors de l'envoi du message.",
      });
    }
  });
};
