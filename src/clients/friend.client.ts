import { friendRepository } from "../repositories/friend.respository";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Service layer handling business logic, rule validations, and domain errors for friendships.
 */
export class FriendClient {
  /**
   * Validates and executes a friend request emission between two users.
   *
   * @param userId - The ID of the requesting user.
   * @param friendId - The ID of the recipient user.
   * @throws {AppError} If users are identical, or if a friendship/pending request already exists.
   * @returns The newly created friendship record.
   */
  async sendFriendRequest(userId: string, friendId: string) {
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

    // Création de la demande via le repository
    return friendRepository.sendRequest(userId, friendId);
  }

  /**
   * Processes a response (accept/reject) to an incoming friend request.
   *
   * @param userId - The ID of the user responding (recipient of the original request).
   * @param friendshipId - The unique ID of the pending friendship request.
   * @param accept - True to accept the request, false to decline/delete it.
   * @throws {AppError} If the request is not found or does not belong to the user.
   * @returns The updated or deleted friendship record.
   */
  async respondToFriendRequest(userId: string, friendshipId: string, accept: boolean) {
    // On s'assure que la demande existe et qu'elle est bien destinée à l'utilisateur connecté
    const pendingRequests = await friendRepository.getPendingRequests(userId);
    const request = pendingRequests.find((req) => req.id === friendshipId);

    if (!request) {
      throw new AppError("Demande d'amitié introuvable ou non autorisée", 404);
    }

    // Acceptation ou refu (suppression de la ligne)
    if (accept) {
      return friendRepository.acceptRequest(friendshipId);
    } else {
      return friendRepository.deleteFriendship(friendshipId);
    }
  }

  /**
   * Fetches the confirmed friends list for a user.
   *
   * @param userId - The user's ID.
   * @returns Array of active friendships.
   */
  async getFriendsList(userId: string) {
    return friendRepository.getFriends(userId);
  }

  /**
   * Fetches pending incoming friend requests for a user.
   *
   * @param userId - The user's ID.
   * @returns Array of pending friend requests.
   */
  async getPendingRequests(userId: string) {
    return friendRepository.getPendingRequests(userId);
  }

  /**
   * Removes an existing active friend connection.
   *
   * @param userId - The initiating user's ID.
   * @param friendId - The target friend's ID to remove.
   * @throws {AppError} If no active friendship exists between the two users.
   * @returns The deleted friendship record.
   */
  async removeFriend(userId: string, friendId: string) {
    // Recherche d'une amitié active
    const friendship = await friendRepository.findFriendship(userId, friendId);

    if (!friendship || friendship.status !== "ACCEPTED") {
      throw new AppError("Relation d'amitié introuvable", 404);
    }

    return friendRepository.deleteFriendship(friendship.id);
  }
}
