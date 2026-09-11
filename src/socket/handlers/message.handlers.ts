// src/socket/handlers/message.handlers.ts
import { Server, Socket } from "socket.io";
import { MessageClient } from "../../clients/message.client";
import { ConversationClient } from "../../clients/conversation.client";
import { prisma } from "../../config/prisma";

const messageClient = new MessageClient();
const conversationClient = new ConversationClient();

/**
 * Registers message-related and typing WebSocket event listeners for an authenticated socket client.
 *
 * @param {Server} io - The global Socket.io server instance
 * @param {Socket} socket - The individual socket connection
 */
export const registerMessageHandlers = (io: Server, socket: Socket) => {
  /**
   * Listens for incoming messages sent by a client.
   * Validates membership, persists to database, broadcasts to the room,
   * and ensures participants who left the conversation are re-added to the socket room to receive it.
   */
  socket.on("message:send", async (data: { content: string; conversationId: string }) => {
    try {
      const { content, conversationId } = data;
      // On récupère l'ID utilisateur injecté de manière sécurisée par le middleware de handshake
      const userId = socket.data.userId;

      // 1. Sécurité : Vérification que l'utilisateur fait bien partie de la conversation
      await conversationClient.verifyUserAccess(userId, conversationId);

      // 2. Persistance : Enregistrement du message en base de données (et réactivation auto des participants en BDD)
      const newMessage = await messageClient.createMessage(content, userId, conversationId);

      // 3. Récupération de tous les participants de la conversation pour gérer les sockets
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId },
        select: { userId: true },
      });

      // 4. Pour chaque participant, on s'assure que sa socket connectée rejoint la room de la conversation
      // (Utile si un participant avait quitté/masqué la conversation et n'était plus dans la room Socket.io)
      const sockets = await io.fetchSockets();
      for (const s of sockets) {
        const sUserId = s.data.userId;
        if (participants.some((p) => p.userId === sUserId)) {
          s.join(conversationId);
        }
      }

      // 5. Diffusion ciblée : On émet le message à tous les membres présents dans la room
      io.to(conversationId).emit("message:received", newMessage);
    } catch (error: any) {
      // Gestion d'erreur : Notification individuelle à l'expéditeur uniquement
      socket.emit("error", {
        message: error.message || "Erreur lors de l'envoi du message.",
      });
    }
  });

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
