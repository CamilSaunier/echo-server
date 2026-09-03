// src/clients/message.client.ts
import { MessageRepository } from "../repositories/message.repository";
import { AppError } from "../middlewares/error.middleware";

/**
 * Client service handling business logic and validations for messages.
 */
export class MessageClient {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Retrieves all messages belonging to a specific conversation.
   *
   * @async
   * @function getMessagesByConversationId
   * @param {string} conversationId - The unique identifier of the target conversation
   * @returns {Promise<any[]>} List of messages ordered chronologically
   * @throws {AppError} If conversation ID is missing
   */
  async getMessagesByConversationId(conversationId: string) {
    // Validation des données d'entrée
    if (!conversationId) {
      throw new AppError("ID de conversation manquant.", 400);
    }

    // Récupération de l'historique complet des messages via le repository
    return await this.messageRepository.findMessagesByConversationId(conversationId);
  }

  /**
   * Retrieves all messages in the system.
   */
  async getAllMessages() {
    return await this.messageRepository.findAllMessages();
  }

  /**
   * Creates a new message record.
   */
  async createMessage(content: string, userId: string, conversationId: string) {
    if (!content || !userId || !conversationId) {
      throw new AppError("Données de message incomplètes.", 400);
    }
    return await this.messageRepository.createMessage(content, userId, conversationId);
  }
}
