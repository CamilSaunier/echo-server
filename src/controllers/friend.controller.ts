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
   * @param req - Express request object containing the recipient's friendId in body
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise resolving to void
   */
  sendFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extraction de l'ID utilisateur authentifié
      const userId = req.user!.userId;
      const { friendId } = req.body;

      const friendship = await this.friendClient.sendFriendRequest(userId, friendId);

      res.status(201).json({
        success: true,
        data: friendship,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Responds to an incoming pending friend request (accept or reject).
   * Route: PATCH /api/friends/request/:friendshipId
   *
   * @param req - Express request object containing friendshipId in params and accept boolean in body
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise resolving to void
   */
  respondToFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const friendshipId = req.params.friendshipId as string;
      const { accept } = req.body;

      if (!friendshipId) {
        throw new AppError("L'identifiant de la demande est requis", 400);
      }

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
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise resolving to void
   */
  getFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;

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
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise resolving to void
   */
  getPendingRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;

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
   * @param req - Express request object containing friendId in params
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise resolving to void
   */
  removeFriend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const friendId = req.params.friendId as string;

      if (!friendId) {
        throw new AppError("L'identifiant de l'ami est requis", 400);
      }

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
