import type { Request, Response, NextFunction } from "express";
import { UserClient } from "../clients/user.client.js";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Controller handling HTTP requests for user operations.
 */
export class UserController {
  private userClient: UserClient;

  constructor() {
    this.userClient = new UserClient();
  }

  /**
   * Handles GET requests to search users by query parameter.
   * Route: GET /api/users/search?q=...
   *
   * @param req - Express request object containing authenticated user context and query params.
   * @param res - Express response object.
   * @param next - Express next function for error handling middleware.
   */
  searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupération de l'ID utilisateur injecté par le middleware auth.middleware
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError("Utilisateur non authentifié", 401);
      }

      const query = req.query.q as string;

      // Renvoi d'un tableau vide si le paramètre 'q' est absent ou trop court
      if (!query || query.trim().length < 2) {
        res.status(200).json({
          success: true,
          data: [],
        });
        return;
      }

      const users = await this.userClient.searchUsers(query, userId);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };
}
