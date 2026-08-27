import { MessageRepository } from "../repositories/message.repository";
import { AppError } from "../middlewares/error.middleware";
import type { Message } from "@prisma/client";

export class MessageClient {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Retrieves all messages.
   * @returns A promise resolving to an array of messages.
   */
  async getAllMessages(): Promise<Message[]> {
    // Récupère la liste de tous les messages via le repository
    return await this.messageRepository.findAll();
  }

  /**
   * Creates a new message after validating its content.
   * @param content - The text content of the message.
   * @param userId - The ID of the user sending the message.
   * @param conversationId - The ID of the target conversation.
   * @returns The created message.
   */
  async createMessage(content: string, userId: string, conversationId: string): Promise<Message> {
    // Vérifie si le contenu est vide ou invalide
    if (!content || content.trim() === "") {
      throw new AppError("Le contenu du message ne peut pas être vide.", 400);
    }

    // Délègue la création au repository en transmettant les relations requises
    return await this.messageRepository.create(content.trim(), userId, conversationId);
  }
}
