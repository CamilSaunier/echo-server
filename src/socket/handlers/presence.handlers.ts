// src/socket/handlers/presence.handlers.ts
import { Server, Socket } from "socket.io";

// Map globale partagée pour suivre les sockets par utilisateur : userId -> Set de socketIds
const onlineUsers = new Map<string, Set<string>>();

export const registerPresenceHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  // 1. Enregistrement à la connexion
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
    // Si c'était sa première session active, on prévient tout le monde
    io.emit("user:status", { userId, isOnline: true });
  }
  onlineUsers.get(userId)?.add(socket.id);

  // Envoi de la liste complète des connectés au nouveau client
  socket.emit("users:online:list", Array.from(onlineUsers.keys()));

  // 2. Gestion de la déconnexion
  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      // S'il n'a plus aucun onglet/socket actif
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("user:status", { userId, isOnline: false });
      }
    }
  });
};
