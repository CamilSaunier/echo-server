import { UserRepository, type SafeUser } from "../repositories/user.repository.js";

/**
 * Client handling user search operations and business logic.
 */
export class UserClient {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Searches users by username excluding the requesting user.
   *
   * @param query - The search term entered by the client.
   * @param currentUserId - The ID of the authenticated user to exclude.
   * @returns A promise resolving to an array of safe user projections.
   */
  async searchUsers(query: string, currentUserId: string): Promise<SafeUser[]> {
    const cleanQuery = query.trim();

    // On évite les requêtes inutilement lourdes si la recherche fait moins de 2 caractères
    if (!cleanQuery || cleanQuery.length < 2) {
      return [];
    }

    return this.userRepository.searchByUsername(cleanQuery, currentUserId);
  }
}
