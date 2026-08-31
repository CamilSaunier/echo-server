// Initialisation du serveur Socket.io et gestion globale
// src/socket/index.ts
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middlewares/auth.middleware";
import { registerMessageHandlers } from "././handlers/message.handlers";
import { registerConversationHandlers } from "././handlers/conversation.handlers";
import { ConversationClient } from "../clients/conversation.client";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const conversationClient = new ConversationClient();

export const configureWebSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`[WebSocket] Client connecté : ${socket.id} (User: ${userId})`);

    try {
      // 1. Assignation automatique de toutes les rooms existantes de l'utilisateur à la connexion
      const conversationIds = await conversationClient.getUserConversationIds(userId);
      for (const conversationId of conversationIds) {
        socket.join(conversationId);
      }
      console.log(`[WebSocket] User ${userId} a rejoint ${conversationIds.length} rooms.`);
    } catch (error) {
      console.error(`[WebSocket] Erreur lors de l'assignation des rooms pour l'user ${userId}:`, error);
    }

    // 2. Enregistrement modulaire des handlers
    registerMessageHandlers(io, socket);
    registerConversationHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client déconnecté : ${socket.id}`);
    });
  });

  return io;
};
