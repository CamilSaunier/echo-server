import type { Request, Response, NextFunction } from "express";
import { MessageClient } from "../clients/message.client";
import { AppError } from "../middlewares/error.middleware";

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
      const messages = await this.messageClient.getAllMessages();
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new message.
   * Route: POST /messages
   */
  createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Récupération sécurisée du userId depuis le middleware JWT
      const userId = req.user?.userId;

      // 2. Extraction des données envoyées par le client
      const { content, conversationId } = req.body;

      if (!userId) {
        throw new AppError("Identifiant utilisateur introuvable dans la requête.", 401);
      }

      // 3. Création du message
      const newMessage = await this.messageClient.createMessage(content, userId, conversationId);

      res.status(201).json(newMessage);
    } catch (error) {
      next(error);
    }
  };
}
