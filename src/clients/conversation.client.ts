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
  /**
   * Finds an existing direct conversation between two users or creates a new one.
   *
   * @async
   * @function getOrCreateDirectConversation
   * @param {string} userId - Current authenticated user ID
   * @param {string} targetUserId - Target friend's user ID
   * @returns {Promise<any>} Direct conversation object
   */
  async getOrCreateDirectConversation(userId: string, targetUserId: string) {
    if (!userId || !targetUserId) {
      throw new AppError("Identifiants utilisateurs requis.", 400);
    }

    if (userId === targetUserId) {
      throw new AppError("Impossible de créer une conversation avec soi-même.", 400);
    }

    const existingConversation = await this.conversationRepository.findDirectConversation(userId, targetUserId);
    if (existingConversation) {
      return existingConversation;
    }

    return await this.conversationRepository.createDirectConversation(userId, targetUserId);
  }

  /**
   * Marks a conversation as left/hidden for the specified user after verifying access.
   *
   * @async
   * @param {string} userId - ID of the user requesting to leave
   * @param {string} conversationId - Target conversation ID
   * @returns {Promise<void>}
   */
  async leaveConversation(userId: string, conversationId: string): Promise<void> {
    await this.verifyUserAccess(userId, conversationId);
    await this.conversationRepository.markParticipantAsLeft(conversationId, userId);
  }
}
