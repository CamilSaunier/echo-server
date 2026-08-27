import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { PasswordUtils } from "../utils/password.utils";
import { JwtUtils } from "../utils/jwt.utils";
import { User } from "@prisma/client";

export class AuthClient {
  private userRepository = new UserRepository();
  private refreshTokenRepository = new RefreshTokenRepository();

  /**
   * Registers a new user.
   *
   * @param data - The registration payload (email, username, password).
   * @returns The newly created user (without sensitive data).
   */
  async register(data: { email: string; username: string; password: string }): Promise<User> {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already in use.");
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
   * @returns The access token and user info.
   */
  async login(credentials: { email: string; password: string }) {
    // 1. Trouver l'utilisateur par son email
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    // 2. Comparer le mot de passe
    const isPasswordValid = await PasswordUtils.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    // 3. Générer les tokens
    const payload = { userId: user.id, email: user.email };
    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    // 4. Stocker le hash du refresh token en BDD (expiration à 7 jours)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // Note: Pour être ultra-propre, on pourrait aussi hacher le refresh token avant de le stocker,
    // mais pour l'instant on peut stocker le token directement ou son hash.
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
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
}
