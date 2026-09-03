// src/repositories/conversation.repository.ts
import { prisma } from "../config/prisma";

/**
 * Repository responsible for direct database interactions with Conversation models using Prisma.
 */
export class ConversationRepository {
  /**
   * Retrieves all detailed conversation records for a given user, including participants and latest message.
   *
   * @async
   * @function findConversationsByUserId
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<any[]>} Array of conversation records with included relations
   */
  async findConversationsByUserId(userId: string) {
    // Requête Prisma pour extraire les conversations auxquelles l'utilisateur participe
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        // Inclusion des données des participants pour afficher les profils dans le chat
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        // Récupération uniquement du dernier message pour l'aperçu dans la liste
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Retrieves all conversation IDs for a specific user.
   *
   * @async
   * @function findConversationIdsByUserId
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<string[]>} Array of conversation IDs
   */
  async findConversationIdsByUserId(userId: string): Promise<string[]> {
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    return participations.map((p) => p.conversationId);
  }

  /**
   * Checks if a user is a participant in a given conversation.
   *
   * @async
   * @function isUserInConversation
   * @param {string} userId - The unique identifier of the user
   * @param {string} conversationId - The unique identifier of the conversation
   * @returns {Promise<boolean>} True if user is participant, false otherwise
   */
  async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      select: { id: true },
    });
    return !!participant;
  }
}
