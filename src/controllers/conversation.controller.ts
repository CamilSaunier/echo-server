// src/controllers/conversation.controller.ts
import type { Request, Response, NextFunction } from "express";
import { ConversationClient } from "../clients/conversation.client";
import { MessageClient } from "../clients/message.client";
import { AppError } from "../middlewares/error.middleware";

/**
 * Controller handling conversation-related HTTP REST endpoints.
 */
export class ConversationController {
  private conversationClient: ConversationClient;
  private messageClient: MessageClient;

  constructor() {
    this.conversationClient = new ConversationClient();
    this.messageClient = new MessageClient();
  }

  /**
   * Retrieves all conversations associated with the currently authenticated user.
   *
   * @async
   * @function getUserConversations
   * @param {Request} req - Express Request object with authenticated user payload
   * @param {Response} res - Express Response object
   * @param {NextFunction} next - Express NextFunction middleware callback
   * @returns {Promise<void>}
   */
  getUserConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupération de userId typé depuis le middleware (req.user)
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError("Identifiant utilisateur introuvable dans la requête.", 401);
      }

      const conversations = await this.conversationClient.getUserConversations(userId);
      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves message history for a given conversation after membership verification.
   *
   * @async
   * @function getConversationMessages
   * @param {Request} req - Express Request object containing conversationId parameter
   * @param {Response} res - Express Response object
   * @param {NextFunction} next - Express NextFunction middleware callback
   * @returns {Promise<void>}
   */
  getConversationMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;

      // Validation du paramètre de route pour rassurer TypeScript et sécuriser l'appel
      if (!conversationId || typeof conversationId !== "string") {
        throw new AppError("Identifiant de conversation invalide ou manquant.", 400);
      }

      // 1. Contrôle d'accès : vérification que l'utilisateur participe bien à la conversation
      await this.conversationClient.verifyUserAccess(userId, conversationId);

      // 2. Extraction de l'historique complet des messages pour la conversation ciblée
      const messages = await this.messageClient.getMessagesByConversationId(conversationId);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };
}
