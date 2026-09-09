// src/clients/message.client.ts
import { MessageRepository } from "../repositories/message.repository";
import { ConversationRepository } from "../repositories/conversation.repository";
import { AppError } from "../middlewares/error.middleware";

/**
 * Client service handling business logic and validations for messages.
 */
export class MessageClient {
  private messageRepository: MessageRepository;
  private conversationRepository: ConversationRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.conversationRepository = new ConversationRepository();
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
   *
   * @async
   * @function getAllMessages
   * @returns {Promise<any[]>} List of all messages in the application
   */
  async getAllMessages() {
    return await this.messageRepository.findAllMessages();
  }

  /**
   * Creates a new message record and reactivates the conversation for all participants.
   *
   * @async
   * @function createMessage
   * @param {string} content - The text content of the message
   * @param {string} userId - The unique identifier of the message author
   * @param {string} conversationId - The unique identifier of the target conversation
   * @returns {Promise<any>} The newly created message object with sender details
   * @throws {AppError} If message data is incomplete
   */
  async createMessage(content: string, userId: string, conversationId: string) {
    if (!content || !userId || !conversationId) {
      throw new AppError("Données de message incomplètes.", 400);
    }

    // Insertion du message en BDD
    const newMessage = await this.messageRepository.createMessage(content, userId, conversationId);

    // Réinitialisation du flag isLeft à false pour tous les participants (fait réapparaître la conv si masquée)
    await this.conversationRepository.reactivateParticipantsOnNewMessage(conversationId);

    return newMessage;
  }
}
