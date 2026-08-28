import { prisma } from "../config/prisma";
import { RefreshToken } from "@prisma/client";

/**
 * Repository for managing refresh token operations in the database.
 */
export class RefreshTokenRepository {
  /**
   * Saves a new refresh token record.
   *
   * @param data - The payload containing userId, token hash, and expiration date.
   * @returns The created RefreshToken object.
   */
  async create(data: { userId: string; token: string; expiresAt: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  /**
   * Finds a refresh token by its hash value and associated user ID.
   *
   * @param userId - The UUID of the user.
   * @param token - The hashed refresh token string.
   * @returns The refresh token object if found, or null otherwise.
   */
  async findByUserAndToken(userId: string, token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: {
        userId,
        token,
      },
    });
  }

  /**
   * Deletes a specific refresh token by its hash value (used on logout).
   *
   * @param token - The hashed refresh token to delete.
   */
  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken
      .delete({
        where: {
          token,
        },
      })
      .catch(() => {
        // Ignore if token doesn't exist
      });
  }

  /**
   * Deletes all refresh tokens for a specific user (logout from all devices).
   *
   * @param userId - The UUID of the user.
   */
  async deleteAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Finds a refresh token record solely by its hash value.
   *
   * @param token - The hashed refresh token string.
   * @returns The refresh token object if found, or null otherwise.
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: { token },
    });
  }
}
