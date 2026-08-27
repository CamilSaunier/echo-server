import { prisma } from "../config/prisma";
import type { Message } from "@prisma/client";

export class MessageRepository {
  /**
   * Retrieves all messages from the database.
   * @returns A promise resolving to an array of messages.
   */
  async findAll(): Promise<Message[]> {
    // Récupère l'ensemble des messages enregistrés en base
    return await prisma.message.findMany();
  }

  /**
   * Creates a new message in the database.
   * @param content - The text content of the message to save.
   * @param userId - The unique identifier of the user sending the message.
   * @param conversationId - The unique identifier of the target conversation.
   * @returns The newly created message, including its ID and timestamp.
   */
  async create(content: string, userId: string, conversationId: string): Promise<Message> {
    // Crée un nouveau message en le rattachant à un utilisateur et une conversation existants
    return await prisma.message.create({
      data: {
        content,
        user: {
          connect: { id: userId },
        },
        conversation: {
          connect: { id: conversationId },
        },
      },
    });
  }
}
