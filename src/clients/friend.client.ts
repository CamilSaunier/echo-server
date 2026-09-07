import { friendRepository, FriendRepository } from "../repositories/friend.respository.js";
import { UserRepository, type SafeUser } from "../repositories/user.repository.js";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Client layer handling business logic, rule validations, and domain errors for friendships.
 */
export class FriendClient {
  private friendRepo: FriendRepository;
  private userRepo: UserRepository;

  constructor() {
    this.friendRepo = friendRepository;
    this.userRepo = new UserRepository();
  }

  /**
   * Validates and executes a friend request emission between two users.
   *
   * @param userId - Unique identifier of the requesting user.
   * @param friendId - Unique identifier of the target user.
   * @returns Promise resolving to the created friendship object.
   * @throws AppError If users are identical, target missing/not found, or relationship already exists.
   */
  async sendFriendRequest(userId: string, friendId: string) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    if (!friendId) {
      throw new AppError("L'identifiant du destinataire est requis", 400);
    }

    if (userId === friendId) {
      throw new AppError("Vous ne pouvez pas vous ajouter vous-même en ami", 400);
    }

    // Vérification de l'existence de l'utilisateur cible
    const targetUser = await this.userRepo.findById(friendId);
    if (!targetUser) {
      throw new AppError("L'utilisateur ciblé n'existe pas", 404);
    }

    // Vérification de l'existence préalable d'une relation
    const existingFriendship = await this.friendRepo.findFriendship(userId, friendId);

    if (existingFriendship) {
      if (existingFriendship.status === "ACCEPTED") {
        throw new AppError("Vous êtes déjà ami avec cet utilisateur", 400);
      }
      if (existingFriendship.status === "PENDING") {
        throw new AppError("Une demande d'amitié est déjà en attente entre vous", 400);
      }
      if (existingFriendship.status === "BLOCKED") {
        throw new AppError("Impossible d'envoyer une demande d'ami à cet utilisateur", 403);
      }
    }

    return this.friendRepo.sendRequest(userId, friendId);
  }

  /**
   * Processes a response (accept or reject) to an incoming friend request.
   *
   * @param userId - Unique identifier of the responding user.
   * @param friendshipId - Unique identifier of the friendship record.
   * @param accept - True to accept the request, false to reject/delete it.
   * @returns Promise resolving to the updated or deleted friendship record.
   * @throws AppError If request is not found, already processed, or user is not the recipient.
   */
  async respondToFriendRequest(userId: string, friendshipId: string, accept: boolean) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    const request = await this.friendRepo.findById(friendshipId);

    if (!request || request.status !== "PENDING") {
      throw new AppError("Demande d'amitié introuvable ou déjà traitée", 404);
    }

    // Seul le destinataire de la demande (friendId) est autorisé à y répondre
    if (request.friendId !== userId) {
      throw new AppError("Vous n'êtes pas autorisé à répondre à cette demande", 403);
    }

    if (accept) {
      return this.friendRepo.acceptRequest(friendshipId);
    }

    return this.friendRepo.deleteFriendship(friendshipId);
  }

  /**
   * Fetches and formats the confirmed friends list for a user.
   *
   * @param userId - Unique identifier of the user.
   * @returns Promise resolving to the list of safe friend profiles.
   * @throws AppError If user is unauthenticated.
   */
  async getFriendsList(userId: string): Promise<SafeUser[]> {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    const friendships = await this.friendRepo.getFriends(userId);

    // Extraction du profil de l'ami selon le sens de la relation
    return friendships.map((f) => {
      const friendData = f.userId === userId ? f.friend : f.user;
      return {
        id: friendData.id,
        username: friendData.username,
        email: friendData.email,
        createdAt: new Date(),
      };
    });
  }

  /**
   * Fetches pending incoming friend requests for a user.
   *
   * @param userId - Unique identifier of the user.
   * @returns Promise resolving to the list of pending friend requests with sender details.
   * @throws AppError If user is unauthenticated.
   */
  async getPendingRequests(userId: string) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    return this.friendRepo.getPendingRequests(userId);
  }

  /**
   * Removes an existing active friend connection.
   *
   * @param userId - Unique identifier of the initiating user.
   * @param friendId - Unique identifier of the target friend to remove.
   * @returns Promise resolving to the deleted friendship record.
   * @throws AppError If user is unauthenticated or friendship relation does not exist.
   */
  async removeFriend(userId: string, friendId: string) {
    if (!userId) {
      throw new AppError("Utilisateur non authentifié", 401);
    }

    if (!friendId) {
      throw new AppError("L'identifiant de l'ami est requis", 400);
    }

    const friendship = await this.friendRepo.findFriendship(userId, friendId);

    if (!friendship || friendship.status !== "ACCEPTED") {
      throw new AppError("Relation d'amitié introuvable", 404);
    }

    return this.friendRepo.deleteFriendship(friendship.id);
  }
}

export const friendClient = new FriendClient();
