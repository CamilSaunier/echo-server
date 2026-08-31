import { prisma } from "../config/prisma";

export class ConversationRepository {
  /**
   * Retrieves all conversation IDs for a specific user.
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
