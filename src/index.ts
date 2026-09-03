// src/index.ts
import express from "express";
import type { Application, Request, Response } from "express";
import http from "http";
import cookieParser from "cookie-parser";
import { helmetMiddleware } from "./middlewares/helmet.middleware";
import { corsMiddleware } from "./middlewares/cors.middleware";
import { apiLimiter } from "./middlewares/limiter.middleware";
import { morganMiddleware } from "./middlewares/morgan.middleware";
import { messageRoutes } from "./routes/message.routes";
import { authRoutes } from "./routes/auth.routes";
import { conversationRoutes } from "./routes/conversation.routes";
import { configureWebSocket } from "./socket";
// 1. Importe ton errorHandler en plus de AppError
import { AppError, errorHandler } from "./middlewares/error.middleware";

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Création explicite du serveur HTTP en y injectant Express
const server = http.createServer(app);

// Initialisation de Socket.io sur le serveur HTTP
configureWebSocket(server);

// --- MIDDLEWARES GLOBAUX ---
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(morganMiddleware);
app.use("/api/", apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// --- ROUTES ---
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Bienvenue sur l'API Echo !" });
});

// Route 404 pour les routes non trouvées (optionnel mais propre)
app.use((req: Request, res: Response, next) => {
  next(new AppError(`Route non trouvée - ${req.originalUrl}`, 404));
});

// 2. LE MIDDLEWARE D'ERREUR GLOBAL SE PLACE ICI (EN DERNIER)
app.use(errorHandler);

// On écoute sur `server`
server.listen(PORT, () => {
  console.log(`[Server] Serveur Echo démarré sur http://localhost:${PORT}`);
});
