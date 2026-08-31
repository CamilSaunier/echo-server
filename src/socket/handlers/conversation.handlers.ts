// src/socket/conversation.handlers.ts
import { Server, Socket } from "socket.io";
import { ConversationClient } from "../../clients/conversation.client";

const conversationClient = new ConversationClient();

/**
 * Registers all conversation-related event listeners for a given socket client.
 */
export const registerConversationHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  // Événement déclenché si l'utilisateur rejoint une nouvelle conversation en cours de session
  socket.on("conversation:join", async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        throw new Error("ID de conversation manquant.");
      }

      // 1. Vérification via le client que l'utilisateur a le droit d'accéder à cette conversation
      await conversationClient.verifyUserAccess(userId, conversationId);

      // 2. Le socket rejoint la room Socket.io correspondante
      socket.join(conversationId);

      console.log(`[WebSocket] User ${userId} a rejoint manuellement la room : ${conversationId}`);
    } catch (error: any) {
      socket.emit("error", {
        message: error.message || "Erreur lors de la jonction à la conversation.",
      });
    }
  });
};
