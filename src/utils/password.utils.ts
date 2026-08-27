import bcrypt from "bcryptjs";

export class PasswordUtils {
  /**
   * Hashes a plain text password using bcrypt.
   * @param password - The plain text password to hash.
   * @returns A promise resolving to the hashed password string.
   */
  static async hash(password: string): Promise<string> {
    // Définit le coût du hachage (nombre de rounds de salage)
    const saltRounds = 10;
    // Génère et retourne le hash du mot de passe
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password.
   * @param password - The plain text password entered by the user.
   * @param hashedPassword - The stored hashed password from the database.
   * @returns A promise resolving to true if they match, false otherwise.
   */
  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    // Compare le mot de passe en clair avec le hash stocké en BDD
    return await bcrypt.compare(password, hashedPassword);
  }
}
