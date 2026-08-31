// src/test-socket.ts
import { io } from "socket.io-client";
import { JwtUtils } from "../src/utils/jwt.utils"; // On importe ton utilitaire JWT

// La variable est automatiquement injectée grâce à --env-file=.env
const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:8000";

async function testWebSocket() {
  console.log("1. Tentative de connexion au WebSocket sans token (doit échouer)...");

  const badClient = io(SOCKET_URL, {
    auth: { token: "faux_token_invalide" },
  });

  badClient.on("connect_error", (err) => {
    console.log("❌ Succès du test d'erreur : Connexion refusée ->", err.message);
    badClient.disconnect();

    // 2. On génère un VRAI token valide à la volée grâce à ton secret
    runSuccessTest();
  });
}

function runSuccessTest() {
  console.log("\n2. Tentative de connexion avec un vrai token généré...");

  // Génération d'un accessToken valide pour un userId de test
  const validAccessToken = JwtUtils.generateAccessToken({ userId: "fa2e63f5-cd6e-4326-9b2a-89a11d303b3f" });

  const client = io(SOCKET_URL, {
    auth: { token: validAccessToken },
  });

  client.on("connect", () => {
    console.log("✅ Connexion réussie ! Socket ID :", client.id);

    // Test d'envoi de message
    client.emit("message:send", {
      content: "Hello world via WebSocket !",
      conversationId: "123e4567-e89b-12d3-a456-426614174000",
    });
  });

  client.on("message:received", (message) => {
    console.log("📩 Message bien reçu du serveur :", message);
    client.disconnect();
    process.exit(0);
  });

  client.on("error", (err) => {
    console.log("❌ Erreur côté serveur reçue :", err);
  });

  client.on("connect_error", (err) => {
    console.log("❌ Échec de la connexion avec le vrai token :", err.message);
  });
}

testWebSocket();
