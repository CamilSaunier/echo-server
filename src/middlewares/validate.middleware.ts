import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { AppError } from "./error.middleware"; // On importe AppError pour l'utiliser ici

/**
 * Middleware de validation générique.
 * Valide les données de la requête et traduit les erreurs Zod en AppError.
 */
export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // Si c'est une erreur Zod, on la transforme en AppError 400
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        // On passe l'erreur formatée (on peut stocker les détails dans l'objet si besoin)
        const validationError = new AppError("Erreur de validation des données", 400);
        // (Optionnel mais propre : on attache les détails au passage)
        (validationError as any).errors = formattedErrors;

        return next(validationError);
      }

      // Pour toute autre erreur inattendue dans la validation
      return next(error);
    }
  };
};
