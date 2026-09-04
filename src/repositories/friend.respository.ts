import { prisma } from "../config/prisma.js";

/**
 * Data Access Object (DAO) for managing Friendship records in PostgreSQL via Prisma.
 */
export class FriendRepository {
  /**
   * Creates a new pending friendship request from a sender to a receiver.
   *
   * @param userId - The ID of the user initiating the request.
   * @param friendId - The ID of the targeted recipient user.
   * @returns The created Friendship database record.
   */
  async sendRequest(userId: string, friendId: string) {
    // Insertion en base d'une demande avec le statut initial "PENDING"
    return prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: "PENDING",
      },
    });
  }

  /**
   * Searches for an existing friendship relation between two users regardless of direction.
   *
   * @param userAId - First user's unique ID.
   * @param userBId - Second user's unique ID.
   * @returns The existing Friendship record if found, otherwise null.
   */
  async findFriendship(userAId: string, userBId: string) {
    // Vérification bidirectionnelle (A vers B ou B vers A)
    return prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userAId, friendId: userBId },
          { userId: userBId, friendId: userAId },
        ],
      },
    });
  }

  /**
   * Updates an existing friendship status to ACCEPTED.
   *
   * @param friendshipId - The unique ID of the friendship record to update.
   * @returns The updated Friendship record.
   */
  async acceptRequest(friendshipId: string) {
    // Passage du statut de la demande à "ACCEPTED"
    return prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });
  }

  /**
   * Removes a friendship or request record from the database.
   *
   * @param friendshipId - The unique ID of the friendship record to delete.
   * @returns The deleted Friendship record.
   */
  async deleteFriendship(friendshipId: string) {
    // Suppression physique de la relation en base
    return prisma.friendship.delete({
      where: { id: friendshipId },
    });
  }

  /**
   * Retrieves all confirmed friendships for a specific user.
   *
   * @param userId - The ID of the target user.
   * @returns List of friendships with populated sender/receiver user profiles.
   */
  async getFriends(userId: string) {
    // Récupération des amitiés validées (où l'utilisateur est soit l'émetteur soit le destinataire)
    return prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
        friend: {
          select: { id: true, username: true, email: true },
        },
      },
    });
  }

  /**
   * Retrieves all pending incoming friend requests received by a user.
   *
   * @param userId - The recipient user's ID.
   * @returns List of pending friendship requests with sender user details.
   */
  async getPendingRequests(userId: string) {
    // Récupération des demandes reçues par cet utilisateur en attente de validation
    return prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    });
  }
}

export const friendRepository = new FriendRepository();
