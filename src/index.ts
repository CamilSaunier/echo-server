import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Route de santé
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`[Server] Serveur Echo démarré sur http://localhost:${PORT}`);
});
