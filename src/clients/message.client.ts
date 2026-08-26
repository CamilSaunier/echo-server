import { MessageRepository } from "../repositories/message.repository";
import type { Message } from "@prisma/client";

export class MessageClient {
  private messageRepository: MessageRepository;

  constructor() {
    // On instancie notre repository pour pouvoir l'utiliser
    this.messageRepository = new MessageRepository();
  }

  /**
   * Récupère la liste de tous les messages via le repository.
   */
  async getAllMessages(): Promise<Message[]> {
    // Ici, on pourrait ajouter de la logique métier si nécessaire (ex: filtrage, formatage)
    return await this.messageRepository.findAll();
  }

  /**
   * Valide et crée un nouveau message.
   * @param content - Le contenu du message.
   */
  async createMessage(content: string): Promise<Message> {
    // Exemple de règle métier simple : vérifier que le message n'est pas vide
    if (!content || content.trim() === "") {
      throw new Error("Le contenu du message ne peut pas être vide.");
    }

    return await this.messageRepository.create(content.trim());
  }
}
