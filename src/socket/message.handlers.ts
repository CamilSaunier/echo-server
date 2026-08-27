// src/socket/message.handlers.ts
import { Server, Socket } from "socket.io";
import { MessageClient } from "../clients/message.client";

// Instanciation du client métier pour dialoguer avec la base de données (Prisma)
const messageClient = new MessageClient();

/**
 * Enregistre tous les écouteurs d'événements liés aux messages pour un client donné.
 * @param io - L'instance globale du serveur Socket.io (pour diffuser à tout le monde)
 * @param socket - La connexion individuelle et unique du client qui vient de se connecter
 */
export const registerMessageHandlers = (io: Server, socket: Socket) => {
  // Écoute de l'événement déclenché par le front-end lorsqu'un utilisateur envoie un message
  socket.on("message:send", async (content: string) => {
    try {
      // 1. Persistance : On passe par notre client pour enregistrer le message en BDD
      const newMessage = await messageClient.createMessage(content);

      // 2. Diffusion (Broadcast) : On envoie le nouveau message validé à TOUS les clients connectés
      // (y compris l'expéditeur, pour confirmer que c'est bien enregistré)
      io.emit("message:received", newMessage);
    } catch (error: any) {
      // 3. Gestion des erreurs : Si la validation ou l'insertion échoue,
      // on prévient UNIQUEMENT l'expéditeur via son socket individuel
      socket.emit("error", {
        message: error.message || "Erreur lors de l'envoi du message.",
      });
    }
  });

  // D'autres écouteurs liés aux messages (ex: "message:delete", "message:edit")
  // pourraient être ajoutés ici de la même manière.
};
