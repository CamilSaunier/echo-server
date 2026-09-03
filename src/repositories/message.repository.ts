import { prisma } from "../config/prisma";
import type { Message } from "@prisma/client";

/**
 * Repository handling direct database operations for Message models via Prisma.
 */
export class MessageRepository {
  /**
   * Fetches all messages from a given conversation, including sender details.
   *
   * @async
   * @function findMessagesByConversationId
   * @param {string} conversationId - The unique identifier of the target conversation
   * @returns {Promise<any[]>} Array of message records sorted chronologically
   */
  async findMessagesByConversationId(conversationId: string) {
    // Requête Prisma pour extraire les messages d'une room par ordre chronologique
    return await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc", // Ordre chronologique pour l'affichage naturel du fil de discussion
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Retrieves all messages stored in the database with basic user details.
   *
   * @async
   * @function findAllMessages
   * @returns {Promise<any[]>} List of all messages in the application
   */
  async findAllMessages() {
    // Extraction globale de tous les messages en BDD (pour administration ou débogage)
    return await prisma.message.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Creates and persists a new message record in the database.
   *
   * @async
   * @function createMessage
   * @param {string} content - The text content of the message
   * @param {string} userId - The unique identifier of the message author
   * @param {string} conversationId - The unique identifier of the target conversation
   * @returns {Promise<any>} The newly created message object with sender details
   */
  async createMessage(content: string, userId: string, conversationId: string) {
    // Insertion du message en BDD et jointure du profil auteur pour le retour HTTP/WebSocket
    return await prisma.message.create({
      data: {
        content,
        userId,
        conversationId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}
