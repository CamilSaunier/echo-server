import type { Request, Response, NextFunction } from "express";
import { MessageClient } from "../clients/message.client";

export class MessageController {
  private messageClient: MessageClient;

  constructor() {
    this.messageClient = new MessageClient();
  }

  /**
   * Retrieves all messages.
   * Route: GET /messages
   */
  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupère l'ensemble des messages
      const messages = await this.messageClient.getAllMessages();
      res.status(200).json(messages);
    } catch (error) {
      // Transmet l'erreur au middleware de gestion globale
      next(error);
    }
  };

  /**
   * Creates a new message.
   * Route: POST /messages
   */
  createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extraction des données nécessaires depuis le corps de la requête
      const { content, userId, conversationId } = req.body;

      // Crée le message en passant les paramètres obligatoires au client métier
      const newMessage = await this.messageClient.createMessage(content, userId, conversationId);

      res.status(201).json(newMessage);
    } catch (error) {
      // Transmet l'erreur au middleware global
      next(error);
    }
  };
}
