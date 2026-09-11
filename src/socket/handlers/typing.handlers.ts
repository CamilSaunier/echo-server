// src/socket/handlers/typing.handlers.ts
import { Server, Socket } from "socket.io";
import { ConversationClient } from "../../clients/conversation.client";

const conversationClient = new ConversationClient();

/**
 * Registers typing-related WebSocket event listeners for an authenticated socket client.
 */
export const registerTypingHandlers = (io: Server, socket: Socket) => {
  /**
   * Listens for typing status updates from a client and broadcasts them to other room members.
   */
  socket.on("typing", async (data: { conversationId: string; isTyping: boolean }) => {
    try {
      const { conversationId, isTyping } = data;
      const userId = socket.data.userId;

      // Vérification rapide d'accès pour éviter l'émission non autorisée dans une room
      await conversationClient.verifyUserAccess(userId, conversationId);

      // Diffusion à tous les membres de la room SAUF à l'expéditeur
      socket.to(conversationId).emit("user:typing", {
        userId,
        isTyping,
      });
    } catch (error) {
      // Erreurs volontairement ignorées pour ne pas saturer les logs en cas de frappe rapide
    }
  });
};
