import { prisma } from "../config/prisma";
import type { Message } from "@prisma/client";

export class MessageRepository {
  /**
   * Récupère la liste de tous les messages en base de données.
   * @returns Une promesse résolue avec un tableau de messages.
   */
  async findAll(): Promise<Message[]> {
    return await prisma.message.findMany();
  }

  /**
   * Crée un nouveau message dans la base de données.
   * @param content - Le contenu textuel du message à enregistrer.
   * @returns Le message qui vient d'être créé (incluant son ID et sa date).
   */
  async create(content: string): Promise<Message> {
    return await prisma.message.create({
      data: {
        content,
      },
    });
  }
}
