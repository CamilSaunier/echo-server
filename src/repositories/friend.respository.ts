import { prisma } from "../config/prisma.js";

export class FriendRepository {
  // Envoyer une demande d'ami
  async sendRequest(userId: string, friendId: string) {
    return prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: "PENDING",
      },
    });
  }

  // Trouver une relation entre deux utilisateurs (dans n'importe quel sens)
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

  // Accepter une demande d'ami
  async acceptRequest(friendshipId: string) {
    return prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });
  }

  // Supprimer une amitié ou refuser une demande
  async deleteFriendship(friendshipId: string) {
    return prisma.friendship.delete({
      where: { id: friendshipId },
    });
  }

  // Récupérer la liste des amis confirmés
  async getFriends(userId: string) {
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

  // Récupérer les demandes en attente reçues
  async getPendingRequests(userId: string) {
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
