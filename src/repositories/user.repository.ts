import { prisma } from "../config/prisma";
import { User } from "@prisma/client";

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
