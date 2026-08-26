import { PrismaClient } from "@prisma/client";

// 1. On crée un pont pour TypeScript :
// On prend l'objet global de l'environnement (globalThis) et on force TypeScript
// à accepter qu'il possède une propriété "prisma" de type "PrismaClient".
// Cela évite que TypeScript ne crie au bug.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 2. On initialise l'instance de Prisma qu'on va exporter dans toute l'app.
export const prisma =
  // On regarde si une instance existe déjà dans l'espace global (grâce au "globalForPrisma").
  globalForPrisma.prisma ||
  // SI ELLE N'EXISTE PAS ENCORE : On en crée une nouvelle.
  // On active les logs pour voir les requêtes SQL, erreurs et avertissements dans le terminal (très utile en dev).
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// 3. La protection pour le mode développement :
// Si on n'est PAS en production (donc en local), on sauvegarde notre instance
// dans la variable globale (globalForPrisma.prisma).
// Ainsi, lors des rechargements automatiques de code, Node.js réutilisera cette même instance
// au lieu d'en ouvrir une nouvelle qui saturerait la base de données.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
