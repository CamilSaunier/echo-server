import crypto from "crypto";

/**
 * Utility class for hashing and safely comparing tokens (like Refresh Tokens)
 * using cryptographic algorithms (SHA-256).
 */
export class TokenUtils {
  /**
   * Hashes a plain text token using the SHA-256 algorithm.
   * This is used before storing a refresh token in the database so that
   * the raw token is never exposed if the database is compromised.
   *
   * @param token - The plain text token string to hash.
   * @returns The hashed token string (hex format).
   */
  static hash(token: string): string {
    // Crée une empreinte cryptographique unique et irréversible du token
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Compares a plain text token with a stored hashed token in a secure way.
   *
   * @param token - The plain text token provided by the client (e.g., from a cookie).
   * @param hashedToken - The stored hash retrieved from the database.
   * @returns True if the tokens match, false otherwise.
   */
  static compare(token: string, hashedToken: string): boolean {
    // 1. On hache le token reçu en clair pour pouvoir le comparer au hash stocké
    const tokenHash = TokenUtils.hash(token);

    // 2. On convertit les deux chaînes en tampons binaires (Buffers) pour la comparaison octet par octet
    const buf1 = Buffer.from(tokenHash);
    const buf2 = Buffer.from(hashedToken);

    // 3. Sécurité : On vérifie que les deux buffers ont exactement la même taille
    if (buf1.length !== buf2.length) {
      return false;
    }

    // 4. Sécurité avancée (Timing-safe) :
    // crypto.timingSafeEqual prend toujours le même temps à s'exécuter,
    // ce qui protège contre les attaques par canal temporel (timing attacks).
    return crypto.timingSafeEqual(buf1, buf2);
  }
}
