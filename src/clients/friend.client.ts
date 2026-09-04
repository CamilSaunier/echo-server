import { friendRepository } from "../repositories/friend.respository";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Service layer handling business logic, rule validations, and domain errors for friendships.
 */
export class FriendClient {
  /**
   * Validates and executes a friend request emission between two users.
   *
   * @param userId - Unique identifier of the requesting user
   * @param friendId - Unique identifier of the target user
   * @returns Promise resolving to the created friendship object
   * @throws AppError If users are identical, unauthenticated, or relationship already exists
   */
  async sendFriendRequest(userId: string, friendId: string) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    if (!friendId) {
      throw new AppError("L'identifiant du destinataire est requis", 400);
    }

    // Interdiction de s'ajouter soi-même
    if (userId === friendId) {
      throw new AppError("Vous ne pouvez pas vous ajouter vous-même en ami", 400);
    }

    // Vérification de l'existence préalable d'une relation
    const existingFriendship = await friendRepository.findFriendship(userId, friendId);

    if (existingFriendship) {
      if (existingFriendship.status === "ACCEPTED") {
        throw new AppError("Vous êtes déjà ami avec cet utilisateur", 400);
      }
      if (existingFriendship.status === "PENDING") {
        throw new AppError("Une demande d'amitié est déjà en attente entre vous", 400);
      }
      if (existingFriendship.status === "BLOCKED") {
        throw new AppError("Impossible d'envoyer une demande d'ami", 403);
      }
    }

    return friendRepository.sendRequest(userId, friendId);
  }

  /**
   * Processes a response (accept or reject) to an incoming friend request.
   *
   * @param userId - Unique identifier of the responding user
   * @param friendshipId - Unique identifier of the friendship record
   * @param accept - True to accept the request, false to reject/delete it
   * @returns Promise resolving to the updated or deleted friendship record
   * @throws AppError If user is unauthenticated or request is not found/unauthorized
   */
  async respondToFriendRequest(userId: string, friendshipId: string, accept: boolean) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    // Contrôle que la demande existe et concerne bien l'utilisateur connecté
    const pendingRequests = await friendRepository.getPendingRequests(userId);
    const request = pendingRequests.find((req: { id: string }) => req.id === friendshipId);

    if (!request) {
      throw new AppError("Demande d'amitié introuvable ou non autorisée", 404);
    }

    if (accept) {
      return friendRepository.acceptRequest(friendshipId);
    } else {
      return friendRepository.deleteFriendship(friendshipId);
    }
  }

  /**
   * Fetches the confirmed friends list for a user.
   *
   * @param userId - Unique identifier of the user
   * @returns Promise resolving to the list of confirmed friends
   * @throws AppError If user is unauthenticated
   */
  async getFriendsList(userId: string) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    return friendRepository.getFriends(userId);
  }

  /**
   * Fetches pending incoming friend requests for a user.
   *
   * @param userId - Unique identifier of the user
   * @returns Promise resolving to the list of pending friend requests
   * @throws AppError If user is unauthenticated
   */
  async getPendingRequests(userId: string) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    return friendRepository.getPendingRequests(userId);
  }

  /**
   * Removes an existing active friend connection.
   *
   * @param userId - Unique identifier of the initiating user
   * @param friendId - Unique identifier of the friend to remove
   * @returns Promise resolving to the deleted friendship record
   * @throws AppError If user is unauthenticated or friendship relation does not exist
   */
  async removeFriend(userId: string, friendId: string) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    if (!friendId) {
      throw new AppError("L'identifiant de l'ami est requis", 400);
    }

    // Vérification que la relation existe et est bien acceptée
    const friendship = await friendRepository.findFriendship(userId, friendId);

    if (!friendship || friendship.status !== "ACCEPTED") {
      throw new AppError("Relation d'amitié introuvable", 404);
    }

    return friendRepository.deleteFriendship(friendship.id);
  }
}
