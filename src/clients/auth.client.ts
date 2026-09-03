// src/clients/auth.client.ts
import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { PasswordUtils } from "../utils/password.utils";
import { JwtUtils } from "../utils/jwt.utils";
import { TokenUtils } from "../utils/hash-token.utils";
import { AppError } from "../middlewares/error.middleware";
import type { User } from "@prisma/client";

export class AuthClient {
  private userRepository = new UserRepository();
  private refreshTokenRepository = new RefreshTokenRepository();

  /**
   * Registers a new user.
   */
  async register(data: { email: string; username: string; password: string }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already in use.", 409);
    }

    const passwordHash = await PasswordUtils.hash(data.password);

    const newUser = await this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
    });

    return newUser;
  }

  /**
   * Authenticates a user and generates access/refresh tokens.
   */
  async login(credentials: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    const isPasswordValid = await PasswordUtils.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials.", 401);
    }

    const accessToken = JwtUtils.generateAccessToken({ userId: user.id, email: user.email });

    // Ajout d'un jti (UUID unique) pour garantir l'unicité du refresh token
    const refreshToken = JwtUtils.generateRefreshToken({
      userId: user.id,
      email: user.email,
      jti: crypto.randomUUID(),
    });

    const tokenHash = TokenUtils.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Retrieves user profile details by ID.
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }

  /**
   * Refreshes the access token and applies Refresh Token Rotation.
   */
  async refreshAccessToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    // 1. Hash du token entrant pour recherche en BDD
    const tokenHash = TokenUtils.hash(rawRefreshToken);

    // 2. Recherche en BDD
    const storedToken = await this.refreshTokenRepository.findByToken(tokenHash);
    if (!storedToken) {
      throw new AppError("Invalid or revoked refresh token", 401);
    }

    // 3. Vérification de l'expiration
    if (storedToken.expiresAt < new Date()) {
      // Si expiré, on le nettoie et on rejette
      await this.refreshTokenRepository.deleteByToken(tokenHash);
      throw new AppError("Refresh token expired", 401);
    }

    // -------------------------------------------------------------
    // 4. ROTATION : ON SUPPRIME IMMÉDIATEMENT L'ANCIEN TOKEN
    // -------------------------------------------------------------
    await this.refreshTokenRepository.deleteById(storedToken.id);

    // 5. Vérification de l'utilisateur
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new AppError("User not found", 401);
    }

    // 6. Génération des nouveaux tokens
    const newAccessToken = JwtUtils.generateAccessToken({ userId: user.id, email: user.email });

    const newRawRefreshToken = JwtUtils.generateRefreshToken({
      userId: user.id,
      email: user.email,
      jti: crypto.randomUUID(), // Empêche les doublons si 2 tokens sont générés dans la même seconde
    });

    const newRefreshTokenHash = TokenUtils.hash(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 7. Sauvegarde du NOUVEAU token uniquement
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshTokenHash,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      newRawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Logs out a user by revoking their refresh token.
   */
  async logout(rawRefreshToken: string) {
    if (rawRefreshToken) {
      const tokenHash = TokenUtils.hash(rawRefreshToken);
      await this.refreshTokenRepository.deleteByToken(tokenHash);
    }
    return {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
      },
    };
  }
}
