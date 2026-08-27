import { Request, Response, NextFunction } from "express";
import { MessageClient } from "../clients/message.client";

export class MessageController {
  private messageClient: MessageClient;

  constructor() {
    this.messageClient = new MessageClient();
  }

  /**
   * Récupère tous les messages.
   * Route: GET /messages
   */
  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messages = await this.messageClient.getAllMessages();
      res.status(200).json(messages);
    } catch (error) {
      // On transmet l'erreur au gestionnaire global
      next(error);
    }
  };

  /**
   * Crée un nouveau message.
   * Route: POST /messages
   */
  createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { content } = req.body;
      const newMessage = await this.messageClient.createMessage(content);
      res.status(201).json(newMessage);
    } catch (error) {
      // On transmet l'erreur (qu'elle vienne de l'AppError du client ou de Prisma) au gestionnaire global
      next(error);
    }
  };
}
