import { prisma } from "../config/prisma";
import type { User } from "@prisma/client";

/**
 * Safe user projection excluding sensitive fields like password hashes.
 * Projection sécurisée de l'utilisateur sans les données sensibles.
 */
export type SafeUser = Pick<User, "id" | "username" | "email" | "createdAt">;

/**
 * Repository for managing user data operations in the database.
 */
export class UserRepository {
  /**
   * Finds a user by their unique email address.
   *
   * @param email - The email address to search for.
   * @returns The user object if found, or null otherwise.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The UUID of the user.
   * @returns The user object if found, or null otherwise.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Finds a user by their exact username.
   * Recherche un utilisateur par son pseudo exact.
   *
   * @param username - The exact username to search for.
   * @returns Safe user projection if found, null otherwise.
   */
  async findByUsername(username: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
  }

  /**
   * Searches users matching a partial or full username (case-insensitive).
   * Recherche des utilisateurs par correspondance partielle sur le pseudo (insensible à la casse).
   *
   * @param query - The search string.
   * @param currentUserId - The ID of the requesting user to exclude from results.
   * @returns Array of safe user projections matching the query.
   */
  async searchByUsername(query: string, currentUserId: string): Promise<SafeUser[]> {
    return prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
        NOT: {
          id: currentUserId,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
      take: 10,
    });
  }

  /**
   * Creates a new user record in the database.
   *
   * @param data - The user creation payload containing email, passwordHash, and username.
   * @returns The newly created user object.
   */
  async create(data: { email: string; passwordHash: string; username: string }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}
