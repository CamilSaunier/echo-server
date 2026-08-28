import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { PasswordUtils } from "../utils/password.utils";
import { JwtUtils } from "../utils/jwt.utils";
import { TokenUtils } from "../utils/hash-token.utils";
import { AppError } from "../middlewares/error.middleware";
import { User } from "@prisma/client";

export class AuthClient {
  private userRepository = new UserRepository();
  private refreshTokenRepository = new RefreshTokenRepository();

  /**
   * Registers a new user.
   *
   * @param data - The registration payload (email, username, password).
   * @returns The newly created user.
   */
  async register(data: { email: string; username: string; password: string }): Promise<User> {
    // 1. Vérifier si l'utilisateur existe déjà -> 400 Bad Request
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already in use.", 409);
    }

    // 2. Hacher le mot de passe
    const passwordHash = await PasswordUtils.hash(data.password);

    // 3. Créer l'utilisateur en base
    const newUser = await this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
    });

    return newUser;
  }

  /**
   * Authenticates a user and generates access/refresh tokens.
   *
   * @param credentials - The login payload (email, password).
   * @returns The access token, raw refresh token, and user info.
   */
  async login(credentials: { email: string; password: string }) {
    // 1. Trouver l'utilisateur par son email -> 401 Unauthorized (on ne divulgue pas si l'email existe ou non)
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    // 2. Comparer le mot de passe -> 401 Unauthorized
    const isPasswordValid = await PasswordUtils.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials.", 401);
    }

    // 3. Générer les tokens (Access et Refresh)
    const payload = { userId: user.id, email: user.email };
    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    // 4. Hacher le refresh token avant de le stocker en base (Sécurité maximale)
    const tokenHash = TokenUtils.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: tokenHash, // On stocke uniquement le hash !
      expiresAt,
    });

    // 5. On retourne le token en clair pour le cookie et l'access token
    return {
      accessToken,
      refreshToken, // Le contrôleur l'enverra dans un cookie HttpOnly
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
  /**
   * Retrieves user profile details by ID.
   *
   * @param userId - The UUID of the user.
   * @returns The sanitized user object.
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
   * Refreshes the access token and applies Refresh Token Rotation by revoking
   * the old refresh token and issuing a new pair.
   *
   * @param rawRefreshToken - The raw refresh token retrieved from the HttpOnly cookie.
   * @returns An object containing the new access token, rotated raw refresh token, and user data.
   */
  async refreshAccessToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    // 1. Hash le toke entrant
    const tokenHash = TokenUtils.hash(rawRefreshToken);

    // 2. Trouve le token dans le BDD
    const storedToken = await this.refreshTokenRepository.findByToken(tokenHash);
    if (!storedToken) {
      throw new AppError("Invalid or revoked refresh token", 401);
    }

    // 3. ROTATION: Efface instantanément le token utilisé pour qu'il ne soit plus réutilisable
    await this.refreshTokenRepository.deleteByToken(tokenHash);

    // 4. Vérifie si le token est expiré
    if (storedToken.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    // 5. Vérifie si l'utilisateur existe toujours
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new AppError("User not found", 401);
    }

    // 6. Génère un nouvelle accessToken
    const payload = { userId: user.id, email: user.email };
    const newAccessToken = JwtUtils.generateAccessToken(payload);

    // 7. Génère et hash un nouveau refresh Token(Rotation)
    const newRawRefreshToken = JwtUtils.generateRefreshToken(payload);
    const newRefreshTokenHash = TokenUtils.hash(newRawRefreshToken);

    // 8. enregistre le nouveau refresh token en BDD (7 days expiration)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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
}
