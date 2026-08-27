import { Request, Response, NextFunction } from "express";

/**
 * Classe personnalisée pour nos erreurs opérationnelles (ex: 404, 401, 403, 400).
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Middleware global de gestion des erreurs (100% agnostique des bibliothèques de validation).
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // 1. Cas de nos erreurs opérationnelles contrôlées (AppError)
  if (err instanceof AppError) {
    const responseBody: any = {
      success: false,
      message: err.message,
    };

    // Si l'erreur embarque des détails supplémentaires (comme les erreurs de validation du middleware)
    if ((err as any).errors) {
      responseBody.errors = (err as any).errors;
    }

    return res.status(err.statusCode).json(responseBody);
  }

  // 2. Cas par défaut : un bug non géré ou une erreur critique (500)
  console.error("ERREUR SERVEUR NON GÉRÉE :", err);
  return res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
  });
};
