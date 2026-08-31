// On récupère l'URL de test depuis l'env, ou on utilise localhost:5433 par défaut pour le dev local
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

import { io as Client, Socket } from "socket.io-client";
import { JwtUtils } from "../src/utils/jwt.utils";
import { prisma } from "../src/config/prisma";

const SERVER_URL = process.env.SOCKET_URL || "http://localhost:8000";

async function runSocketTest() {
  console.log("🚀 Lancement des tests WebSocket...\n");

  // ---------------------------------------------------------------------------
  // ÉTAPE 1 : Test sans token (Doit échouer)
  // ---------------------------------------------------------------------------
  console.log("1. Tentative de connexion au WebSocket sans token (doit échouer)...");
  await new Promise<void>((resolve) => {
    const badClient = Client(SERVER_URL, { autoConnect: true });

    badClient.on("connect_error", (err) => {
      console.log(`❌ Succès du test d'erreur : Connexion refusée -> ${err.message}`);
      badClient.disconnect();
      resolve();
    });
  });

  console.log("");

  // ---------------------------------------------------------------------------
  // PRÉ-REQUIS : Récupérer un vrai utilisateur et une conversation en BDD
  // ---------------------------------------------------------------------------
  console.log("2. Préparation des données de test en base...");

  // On récupère ou crée un utilisateur de test
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test.socket@example.com",
        username: "SocketTester",
        passwordHash: "fake_hash",
      },
    });
  }

  // On récupère ou crée une conversation et sa participation pour cet user
  let participation = await prisma.conversationParticipant.findFirst({
    where: { userId: user.id },
  });

  if (!participation) {
    const conversation = await prisma.conversation.create({ data: {} });
    participation = await prisma.conversationParticipant.create({
      data: {
        userId: user.id,
        conversationId: conversation.id,
      },
    });
  }

  const validConversationId = participation.conversationId;
  const validToken = JwtUtils.generateAccessToken({ userId: user.id, email: user.email });

  console.log(`✅ Données prêtes (User: ${user.id}, Conversation: ${validConversationId})\n`);

  // ---------------------------------------------------------------------------
  // ÉTAPE 3 : Connexion avec token et test d'envoi/réception de message
  // ---------------------------------------------------------------------------
  console.log("3. Tentative de connexion avec un vrai token et test des rooms...");

  const clientSocket: Socket = Client(SERVER_URL, {
    auth: { token: validToken },
    autoConnect: true,
  });

  clientSocket.on("connect", () => {
    console.log(`✅ Connexion réussie ! Socket ID : ${clientSocket.id}`);
    console.log("📤 Envoi d'un message via WebSocket...");

    // On envoie le message dans la room de conversation
    clientSocket.emit("message:send", {
      content: "Hello world via WebSocket architectural test !",
      conversationId: validConversationId,
    });
  });

  // On écoute la confirmation de réception par le serveur (via la Room)
  clientSocket.on("message:received", (message) => {
    console.log("✅ Message bien reçu de la Room via Socket.io :", message);

    // Nettoyage et fin du test
    clientSocket.disconnect();
    console.log("\n🎉 Tous les tests WebSocket sont passés avec succès !");
    process.exit(0);
  });

  // Gestion des erreurs inattendues sur le socket connecté
  clientSocket.on("error", (err: any) => {
    console.error("❌ Erreur reçue du serveur WebSocket :", err);
    clientSocket.disconnect();
    process.exit(1);
  });

  clientSocket.on("connect_error", (err) => {
    console.error("❌ Erreur de connexion avec le token :", err.message);
    process.exit(1);
  });
}

runSocketTest().catch((err) => {
  console.error("❌ Erreur fatale pendant le test :", err);
  process.exit(1);
});
