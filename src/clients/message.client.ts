import { MessageRepository } from "../repositories/message.repository";
import { AppError } from "../middlewares/error.middleware";
import type { Message } from "@prisma/client";

export class MessageClient {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async getAllMessages(): Promise<Message[]> {
    return await this.messageRepository.findAll();
  }

  async createMessage(content: string): Promise<Message> {
    // Si le contenu est vide, on lève une AppError propre (400 Bad Request)
    if (!content || content.trim() === "") {
      throw new AppError("Le contenu du message ne peut pas être vide.", 400);
    }

    return await this.messageRepository.create(content.trim());
  }
}
