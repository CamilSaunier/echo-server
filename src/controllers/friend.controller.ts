import type { Request, Response, NextFunction } from "express";
import { FriendClient } from "../clients/friend.client.js";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Controller handling HTTP requests related to user friendships and friend requests.
 */
export class FriendController {
  private friendClient: FriendClient;

  constructor() {
    this.friendClient = new FriendClient();
  }

  /**
   * Sends a new friend request to another user.
   * Route: POST /api/friends/request
   *
   * @param req - Express Request containing user payload and friendId in body.
   * @param res - Express Response object.
   * @param next - Express NextFunction for middleware error propagation.
   */
  sendFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupération de l'ID de l'utilisateur connecté via le middleware d'authentification
      const userId = (req as any).user.id;
      const { friendId } = req.body;

      // Délégation de la création de la demande au client métier
      const friendship = await this.friendClient.sendFriendRequest(userId, friendId);

      res.status(201).json({
        success: true,
        data: friendship,
      });
    } catch (error) {
      // Transmission de l'erreur au middleware global d'erreurs
      next(error);
    }
  };

  /**
   * Responds to an incoming pending friend request (accept or reject).
   * Route: PATCH /api/friends/request/:friendshipId
   *
   * @param req - Express Request containing friendshipId parameter and accept boolean in body.
   * @param res - Express Response object.
   * @param next - Express NextFunction for middleware error propagation.
   */
  respondToFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupération de l'utilisateur connecté
      const userId = (req as any).user.id;
      const friendshipId = req.params.friendshipId as string;
      const { accept } = req.body;

      if (!friendshipId) {
        throw new AppError("L'identifiant de la demande est requis", 400);
      }

      // Traitement de la réponse (acceptation ou refus/suppression)
      const result = await this.friendClient.respondToFriendRequest(userId, friendshipId, accept);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves the list of active confirmed friends for the authenticated user.
   * Route: GET /api/friends
   *
   * @param req - Express Request with authenticated user context.
   * @param res - Express Response object.
   * @param next - Express NextFunction for middleware error propagation.
   */
  getFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      // Récupération de la liste des amis confirmés
      const friends = await this.friendClient.getFriendsList(userId);

      res.status(200).json({
        success: true,
        data: friends,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves incoming pending friend requests for the authenticated user.
   * Route: GET /api/friends/requests/pending
   *
   * @param req - Express Request with authenticated user context.
   * @param res - Express Response object.
   * @param next - Express NextFunction for middleware error propagation.
   */
  getPendingRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      // Récupération des demandes d'amis en attente reçues
      const pendingRequests = await this.friendClient.getPendingRequests(userId);

      res.status(200).json({
        success: true,
        data: pendingRequests,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Removes a friend from the user's friend list.
   * Route: DELETE /api/friends/:friendId
   *
   * @param req - Express Request containing target friendId in path parameters.
   * @param res - Express Response object.
   * @param next - Express NextFunction for middleware error propagation.
   */
  removeFriend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupération de l'utilisateur et extraction de l'ID de l'ami à supprimer
      const userId = (req as any).user.id;
      const friendId = req.params.friendId as string;

      if (!friendId) {
        throw new AppError("L'identifiant de l'ami est requis", 400);
      }

      // Suppression de l'amitié en base
      await this.friendClient.removeFriend(userId, friendId);

      res.status(200).json({
        success: true,
        message: "Ami supprimé avec succès",
      });
    } catch (error) {
      next(error);
    }
  };
}
