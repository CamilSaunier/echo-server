// Initialisation du serveur Socket.io et gestion globale
// src/socket/index.ts
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middlewares/auth.middleware"; // 1. Import du middleware
import { registerMessageHandlers } from "./message.handlers";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const configureWebSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // 2. Application du middleware pour intercepter toutes les connexions entrantes
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    // 3. À partir d'ici, socket.data.userId est garanti d'être présent et authentifié
    console.log(`[WebSocket] Client connecté : ${socket.id} (User: ${socket.data.userId})`);

    // --- on essaie de rester SoC en branchant les modules un par un ---
    registerMessageHandlers(io, socket);

    // Gestion de la déconnexion globale pour ce socket
    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client déconnecté : ${socket.id}`);
    });
  });

  return io;
};
