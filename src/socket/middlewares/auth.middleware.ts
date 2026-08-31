// src/socket/middlewares/auth.middleware.ts
import { Socket } from "socket.io";
import { JwtUtils } from "../../utils/jwt.utils";
import { AppError } from "../../middlewares/error.middleware"; // import de la classe de gestion d'erreur

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      // On utilise ta classe AppError avec un statut (ex: 401)
      return next(new AppError("Authentication error: Token missing", 401));
    }

    const payload = JwtUtils.verifyAccessToken(token);
    socket.data.userId = payload.userId;

    next();
  } catch (error: any) {
    // ⚠️ On log l'erreur exacte pour voir ce qui se passe sous le capot
    console.error("🔥 DEBUG - Erreur JWT interceptée :", error.message);
    console.error("🔥 ERREUR CATCHEE DIRECTE :", error);
    console.error("🔥 MESSAGE :", error.message);
    console.error("🔥 STACK :", error.stack);

    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError("Authentication error: Invalid token", 401));
  }
};
