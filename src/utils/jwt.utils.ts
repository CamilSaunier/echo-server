import jwt from "jsonwebtoken";

// Clés secrètes distinctes pour une sécurité renforcée (avec fallbacks pour le dev)
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-key-default";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-key-default";

export class JwtUtils {
  /**
   * Generates a short-lived Access Token (15 minutes).
   * @param payload - The object containing user data to embed.
   * @returns A signed JWT access token string.
   */
  static generateAccessToken(payload: object): string {
    // Crée un access token de courte durée (15 min) destiné à être stocké en RAM/LocalStorage côté client
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "15m" });
  }

  /**
   * Generates a long-lived Refresh Token (7 days).
   * @param payload - The object containing user data to embed.
   * @returns A signed JWT refresh token string.
   */
  static generateRefreshToken(payload: object): string {
    // Crée un refresh token de longue durée (7 jours) destiné au cookie HttpOnly
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  }

  /**
   * Verifies and decodes an Access Token.
   * @param token - The access token string to verify.
   * @returns The decoded payload if the token is valid.
   */
  static verifyAccessToken(token: string): any {
    // Vérifie l'intégrité de l'access token avec la clé dédiée
    return jwt.verify(token, JWT_ACCESS_SECRET);
  }

  /**
   * Verifies and decodes a Refresh Token.
   * @param token - The refresh token string to verify.
   * @returns The decoded payload if the token is valid.
   */
  static verifyRefreshToken(token: string): any {
    // Vérifie l'intégrité du refresh token avec la clé dédiée
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }
}
