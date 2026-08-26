// src/middlewares/morgan.middleware.ts
import morgan from "morgan";

// Utilisation du format 'dev' : coloré, concis, idéal pour le développement
export const morganMiddleware = morgan("dev");
