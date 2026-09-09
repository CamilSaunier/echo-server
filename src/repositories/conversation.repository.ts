// src/repositories/conversation.repository.ts
import { prisma } from "../config/prisma";

/**
 * Repository responsible for direct database interactions with Conversation models using Prisma.
 */
export class ConversationRepository {
  /**
   * Retrieves all detailed conversation records for a given user where they haven't left, including participants and latest message.
   *
   * @async
   * @function findConversationsByUserId
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<any[]>} Array of conversation records with included relations
   */
  async findConversationsByUserId(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            isLeft: false, // On ne récupère que les conversations non quittées/masquées
          },
        },
      },
      include: {
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
   * Retrieves all conversation IDs for a specific user where they haven't left.
   *
   * @async
   * @function findConversationIdsByUserId
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<string[]>} Array of conversation IDs
   */
  async findConversationIdsByUserId(userId: string): Promise<string[]> {
    const participations = await prisma.conversationParticipant.findMany({
      where: {
        userId,
        isLeft: false,
      },
      select: { conversationId: true },
    });
    return participations.map((p) => p.conversationId);
  }

  /**
   * Checks if a user is a participant in a given conversation (and active).
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

  /**
   * Finds an existing direct (1-to-1) conversation between two users (even if hidden/left by one).
   *
   * @async
   * @function findDirectConversation
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Promise<any | null>} Conversation object with relations if exists
   */
  async findDirectConversation(userId1: string, userId2: string) {
    return await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [{ participants: { some: { userId: userId1 } } }, { participants: { some: { userId: userId2 } } }],
      },
      include: {
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });
  }

  /**
   * Creates a new direct (1-to-1) conversation between two users.
   *
   * @async
   * @function createDirectConversation
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Promise<any>} Created conversation object with relations
   */
  async createDirectConversation(userId1: string, userId2: string) {
    return await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }],
        },
      },
      include: {
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });
  }

  /**
   * Marks a conversation as left/hidden for a specific user instead of deleting the relation.
   *
   * @async
   * @param {string} conversationId - The unique identifier of the conversation
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<any>} Updated participant record
   */
  async markParticipantAsLeft(conversationId: string, userId: string) {
    return prisma.conversationParticipant.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      data: {
        isLeft: true,
      } as any,
    });
  }

  /**
   * Resets the isLeft flag for all participants in a conversation when a new message is sent.
   *
   * @async
   * @param {string} conversationId - The unique identifier of the conversation
   */
  async reactivateParticipantsOnNewMessage(conversationId: string) {
    return prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
      },
      data: {
        isLeft: false,
      },
    });
  }
}
