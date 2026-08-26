// src/index.ts
import express, { Application, Request, Response } from "express";
import { helmetMiddleware } from "./middlewares/helmet.middleware";
import { corsMiddleware } from "./middlewares/cors.middleware";
import { apiLimiter } from "./middlewares/limiter.middleware";
import { morganMiddleware } from "./middlewares/morgan.middleware";
import { messageRoutes } from "./routes/message.routes";

const app: Application = express();
const PORT = process.env.PORT || 4000;

// 1. Sécurité des en-têtes HTTP
app.use(helmetMiddleware);

// 2. Gestion des CORS
app.use(corsMiddleware);

// 3. Logger les requêtes HTTP dans la console (doit être placé tôt)
app.use(morganMiddleware);

// 4. Limitation du taux de requêtes
app.use("/api/", apiLimiter);

// 5. Parsing du corps des requêtes en JSON
app.use(express.json({ limit: "10kb" }));

// 6. Routes de l'API
app.use("/api/messages", messageRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Bienvenue sur l'API Echo !" });
});

app.listen(PORT, () => {
  console.log(`[Server] Serveur Echo démarré sur http://localhost:${PORT}`);
});
