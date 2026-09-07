import { prisma } from "../config/prisma";

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
   * Retrieves a specific friendship record by its unique identifier.
   *
   * @param friendshipId - The unique ID of the friendship.
   * @returns The Friendship record with user details if found, or null.
   */
  async findById(friendshipId: string) {
    return prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        user: { select: { id: true, username: true, email: true } },
        friend: { select: { id: true, username: true, email: true } },
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
    return prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        friend: { select: { id: true, username: true, email: true } },
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
    return prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  /**
   * Retrieves all pending outgoing friend requests sent by a user.
   *
   * @param userId - The sender user's ID.
   * @returns List of pending friendship requests sent to other users.
   */
  async getSentRequests(userId: string) {
    return prisma.friendship.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      include: {
        friend: { select: { id: true, username: true, email: true } },
      },
    });
  }
}

export const friendRepository = new FriendRepository();
