# Documentation - Module WebSocket (Socket.io) ("src:socket/index.ts")

Ce module gère la communication bidirectionnelle en temps réel pour le projet **Echo**. Il s'intègre en parallèle d'Express pour permettre une diffusion instantanée des messages auprès de tous les clients connectés.

---

## 🏗️ Architecture et Responsabilités

Pour maintenir une architecture propre (Clean Architecture) et éviter le couplage fort :

1. **Le serveur HTTP (`index.ts`)** : Initialise le serveur Node.js natif en fusionnant Express et Socket.io.
2. **Le gestionnaire de connexion (`src/socket/index.ts`)** : Configure les règles globales de Socket.io (notamment les CORS) et intercepte les connexions entrantes.
3. **Les Handlers (`src/socket/handlers.ts`)** : Écoutent les événements spécifiques envoyés par les clients et orchestrent les actions.
4. **La Couche Métier (`src/clients/message.client.ts`)** : Réutilisée à l'identique par les routes HTTP et les WebSockets pour valider et persister les données via Prisma.

---

## 🔄 Flux d'un message en temps réel

1. **Connexion (`connection`)** :
   Un client établit une liaison persistante avec le serveur. Un identifiant unique (`socket.id`) lui est attribué.
2. **Événement client (`message:send`)** :
   Le client envoie un payload (le contenu du message) via le canal WebSocket.
3. **Traitement et Persistance** :
   Le handler intercepte l'événement, appelle `MessageClient.createMessage()`, ce qui applique les règles métier (vérification du contenu) et sauvegarde le message en base PostgreSQL via Prisma.
4. **Diffusion globale (`io.emit`)** :
   Une fois le message validé et enregistré, le serveur le rediffuse instantanément à **tous** les clients connectés (`message:received`), assurant la synchronisation en temps réel.

---

## 📡 Événements gérés (API WebSocket)

### Côté Serveur (Écoute / `socket.on`)

- `connection` : Déclenché lorsqu'un client se connecte au serveur.
- `message:send` : Reçoit le texte d'un message de la part d'un client.
- `disconnect` : Déclenché lorsqu'un client se déconnecte (fermeture de l'onglet, perte de réseau).

### Côté Serveur (Émission / `socket.emit` ou `io.emit`)

- `message:received` : Diffuse le nouveau message enregistré à l'ensemble des clients connectés.
- `error` : Renvoie un message d'erreur ciblé à l'expéditeur si la validation échoue (ex: message vide).

---

## 💻 Exemple d'utilisation (Côté Client - React / Vite)

```typescript
import { io } from "socket.io-client";

// Connexion au serveur WebSocket
const socket = io("http://localhost:4000", {
  withCredentials: true,
});

// Écouter l'arrivée des nouveaux messages en temps réel
socket.on("message:received", (newMessage) => {
  console.log("Nouveau message reçu :", newMessage);
});

// Envoyer un message
const sendMessage = (content: string) => {
  socket.emit("message:send", content);
};
```

C'est dans les handlers (src/socket/handlers.ts) que ce fais la passerelle entre le temps réel et la base de données. Le scénario classique quand un utilisateur envoie un message en live, c'est un enchaînement comme ça :

Le client envoie un événement via le WebSocket :
socket.emit("send_message", "Salut tout le monde !");

Ton serveur (dans handlers.ts) écoute cet événement :
socket.on("send_message", async (content) => { ... })

Il utilise Prisma (exactement comme pour ton API REST) pour stocker le message en base de données :
const savedMessage = await prisma.message.create({ data: { content } });

Il rediffuse ce message sauvegardé à tout le monde (ou aux autres) via Socket.io :
io.emit("new_message", savedMessage);

```typescript
// La logique métier des events (ex: réception/envoi de messages)
//Server représente l'ensemble du serveur de temps réel
//Socket représente un utilisateur unique qui viens de se connecter
import { Server, Socket } from "socket.io";
import { MessageClient } from "../clients/message.client";

// On prépare notre client/service pour pouvoir interagir avec la BDD
const messageClient = new MessageClient();

// Cette fonction globale va recevoir l'état du serveur (io) et la connexion d'un utilisateur (socket)
export const registerSocketHandlers = (io: Server, socket: Socket) => {
  // IO représente l'instance globale du serveur
  // SOCKET représente la connexion individuelle d'un client spécifique
  console.log(`[WebSocket] Client connecté : ${socket.id}`);

  // 1. ICI ON ÉCOUTE : "Quand un client envoie l'événement 'message:send'..."
  socket.on("message:send", async (content: string) => {
    try {
      // 2. ON AGIT : On utilise le Message.client.ts pour valider et enregistrer en BDD
      const newMessage = await messageClient.createMessage(content);

      // 3. ON DIFFUSE : On envoie le nouveau message à TOUS les clients connectés (le "broadcast")
      io.emit("message:received", newMessage);
    } catch (error: any) {
      // 4. GESTION DES ERREURS : Si le message est vide par exemple, on prévient l'expéditeur
      socket.emit("error", { message: error.message || "Erreur lors de l'envoi du message." });
    }
  });

  // Quand ce client particulier ferme sa page ou perd la connexion
  socket.on("disconnect", () => {
    console.log(`[WebSocket] Client déconnecté : ${socket.id}`);
  });
};
```
