import jwt from "jsonwebtoken";

// Récupération de la clé secrète JWT depuis les variables d'environnement (avec valeur de secours pour le dev)
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-default";

export class JwtUtils {
  /**
   * Generates a JSON Web Token (JWT) for a given user payload.
   * @param payload - The object containing user data to embed in the token (e.g., id, email).
   * @returns A signed JWT string valid for 7 days.
   */
  static generateToken(payload: object): string {
    // Crée et signe le token avec une expiration fixée à 7 jours
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  }

  /**
   * Verifies and decodes a JSON Web Token (JWT).
   * @param token - The JWT string to verify.
   * @returns The decoded payload if the token is valid.
   */
  static verifyToken(token: string): any {
    // Vérifie l'intégrité et la validité du token à l'aide de la clé secrète
    return jwt.verify(token, JWT_SECRET);
  }
}
