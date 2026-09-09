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
      const userId = req.user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        throw new AppError("Identifiant utilisateur introuvable dans la requête.", 401);
      }

      if (!conversationId || typeof conversationId !== "string") {
        throw new AppError("Identifiant de conversation invalide ou manquant.", 400);
      }

      // 1. Contrôle d'accès
      await this.conversationClient.verifyUserAccess(userId, conversationId);

      // 2. Récupération des messages
      const messages = await this.messageClient.getMessagesByConversationId(conversationId);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };
  /**
   * Starts or retrieves an existing 1-to-1 direct conversation with another user.
   */
  getOrCreateDirectConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.body;

      if (!userId) {
        throw new AppError("Identifiant utilisateur introuvable dans la requête.", 401);
      }

      if (!targetUserId || typeof targetUserId !== "string") {
        throw new AppError("Identifiant du destinataire invalide.", 400);
      }

      const conversation = await this.conversationClient.getOrCreateDirectConversation(userId, targetUserId);
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Removes the authenticated user from a specified conversation.
   *
   * @async
   * @function leaveConversation
   * @param {Request} req - Express Request object containing conversationId parameter
   * @param {Response} res - Express Response object
   * @param {NextFunction} next - Express NextFunction middleware callback
   * @returns {Promise<void>}
   */
  leaveConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        throw new AppError("Identifiant utilisateur introuvable dans la requête.", 401);
      }

      if (!conversationId || typeof conversationId !== "string") {
        throw new AppError("Identifiant de conversation invalide ou manquant.", 400);
      }

      await this.conversationClient.leaveConversation(userId, conversationId);
      res.status(200).json({ message: "Conversation quittée avec succès." });
    } catch (error) {
      next(error);
    }
  };
}
