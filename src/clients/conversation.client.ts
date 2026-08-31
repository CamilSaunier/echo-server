import { ConversationRepository } from "../repositories/conversation.repository";
import { AppError } from "../middlewares/error.middleware";

export class ConversationClient {
  private conversationRepository: ConversationRepository;

  constructor() {
    this.conversationRepository = new ConversationRepository();
  }

  /**
   * Retrieves all conversation IDs for a given user.
   */
  async getUserConversationIds(userId: string): Promise<string[]> {
    if (!userId) {
      throw new AppError("ID utilisateur manquant.", 400);
    }
    return await this.conversationRepository.findConversationIdsByUserId(userId);
  }

  /**
   * Verifies if a user has access to a specific conversation.
   */
  async verifyUserAccess(userId: string, conversationId: string): Promise<void> {
    if (!userId || !conversationId) {
      throw new AppError("Paramètres de vérification manquants.", 400);
    }

    const isMember = await this.conversationRepository.isUserInConversation(userId, conversationId);
    if (!isMember) {
      throw new AppError("Accès refusé : vous ne participez pas à cette conversation.", 403);
    }
  }
}
