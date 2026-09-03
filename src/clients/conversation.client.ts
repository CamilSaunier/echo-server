// src/clients/conversation.client.ts
import { ConversationRepository } from "../repositories/conversation.repository";
import { AppError } from "../middlewares/error.middleware";

/**
 * Client service handling business logic and validation for conversations.
 */
export class ConversationClient {
  private conversationRepository: ConversationRepository;

  constructor() {
    this.conversationRepository = new ConversationRepository();
  }

  /**
   * Retrieves all detailed conversation objects for a given user.
   *
   * @async
   * @function getUserConversations
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<any[]>} List of conversation objects including relations
   * @throws {AppError} If the user ID is missing
   */
  async getUserConversations(userId: string) {
    if (!userId) {
      throw new AppError("ID utilisateur manquant.", 400);
    }
    // Récupération des données complètes des conversations via le repository
    return await this.conversationRepository.findConversationsByUserId(userId);
  }

  /**
   * Retrieves all conversation IDs for a given user.
   *
   * @async
   * @function getUserConversationIds
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<string[]>} Array of conversation IDs
   * @throws {AppError} If the user ID is missing
   */
  async getUserConversationIds(userId: string): Promise<string[]> {
    if (!userId) {
      throw new AppError("ID utilisateur manquant.", 400);
    }
    return await this.conversationRepository.findConversationIdsByUserId(userId);
  }

  /**
   * Verifies if a user has access to a specific conversation.
   *
   * @async
   * @function verifyUserAccess
   * @param {string} userId - The unique identifier of the user
   * @param {string} conversationId - The unique identifier of the conversation
   * @returns {Promise<void>}
   * @throws {AppError} If parameters are missing or access is denied
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
