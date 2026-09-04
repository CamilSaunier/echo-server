import express from "express";
import type { Application, Request, Response } from "express";
import http from "http";
import cookieParser from "cookie-parser";

// Middlewares
import { helmetMiddleware } from "./middlewares/helmet.middleware.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import { apiLimiter } from "./middlewares/limiter.middleware.js";
import { morganMiddleware } from "./middlewares/morgan.middleware.js";
import { AppError, errorHandler } from "./middlewares/error.middleware.js";

// Routes
import { authRoutes } from "./routes/auth.routes.js";
import { conversationRoutes } from "./routes/conversation.routes.js";
import { friendRoutes } from "./routes/friend.routes.js";
import { messageRoutes } from "./routes/message.routes.js";

// WebSockets
import { configureWebSocket } from "./socket";

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Création du serveur HTTP et injection de Socket.io
const server = http.createServer(app);
configureWebSocket(server);

// --- MIDDLEWARES GLOBAUX ---
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(morganMiddleware);
app.use("/api/", apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// --- ROUTES API ---
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);

// Healthcheck / Route racine
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Bienvenue sur l'API Echo !" });
});

// Gérer les routes non trouvées (404)
app.use((req: Request, res: Response, next) => {
  next(new AppError(`Route non trouvée - ${req.originalUrl}`, 404));
});

// --- MIDDLEWARE D'ERREUR GLOBAL (Dernière position) ---
app.use(errorHandler);

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`[Server] Serveur Echo démarré sur http://localhost:${PORT}`);
});
