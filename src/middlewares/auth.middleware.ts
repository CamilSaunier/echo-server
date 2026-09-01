import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware"; // Import de ta classe d'erreur personnalisée

// ==========================================
// 1. AUGMENTATION DU TYPE EXPRESS (Request)
// ==========================================
// On indique à TypeScript d'étendre l'interface Request d'Express
// pour y ajouter une propriété optionnelle "user".
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

// ==========================================
// 2. LE MIDDLEWARE D'AUTHENTIFICATION
// ==========================================
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Récupération du header "Authorization" envoyé par le client
  const authHeader = req.headers["authorization"];

  // Extraction du token : on attend le format "Bearer <TOKEN>"
  // Si le header existe, on sépare par l'espace et on prend le 2e élément (index 1)
  const token = authHeader && authHeader.split(" ")[1];

  // Si aucun token n'est trouvé dans les headers, on bloque la requête (401 Non autorisé)
  if (!token) {
    throw new AppError("Access token missing", 401);
  }

  // Récupération de la clé secrète dédiée aux Access Tokens depuis les variables d'environnement
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
  }

  // Vérification de la validité cryptographique et de l'expiration du JWT
  jwt.verify(token, secret, (err, decoded) => {
    // Si le token est invalide, falsifié ou expiré, jwt.verify renvoie une erreur
    if (err) {
      return next(new AppError("Invalid or expired access token", 401));
    }

    // Si tout est ok, on attache les données décodées (userId, email) à l'objet req
    // pour que les prochains contrôleurs sachent qui fait la requête
    req.user = decoded as { userId: string; email: string };

    // On passe le relais au middleware ou au contrôleur suivant
    next();
  });
};
