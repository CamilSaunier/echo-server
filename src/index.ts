import express from "express";
import { messageRoutes } from "./routes/message.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Enregistrement des routes de l'API
app.use("/api/messages", messageRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`[Server] Serveur Echo démarré sur http://localhost:${PORT}`);
});
