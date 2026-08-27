# Documentation - Initialisation WebSocket (`src/socket/index.ts`)

Ce fichier fait la passerelle entre ton serveur HTTP natif (Node.js) et la bibliothèque **Socket.io**. Son rôle est purement infrastructurel : il configure le serveur temps réel et intercepte les connexions entrantes.

---

## ⚙️ Rôles principaux

1. **La fusion des serveurs (HTTP & WebSocket)** :
   Socket.io a besoin d'écouter par-dessus un serveur HTTP Node.js existant (celui qui fait tourner Express). C'est ici qu'on lui passe l'instance du serveur HTTP.
2. **La sécurité et les CORS** :
   Puisque les WebSockets traversent les navigateurs, il faut configurer les CORS au niveau de Socket.io exactement comme on l'a fait pour Express (en autorisant l'URL du front-end et les credentials).
3. **Le routage des connexions** :
   À chaque fois qu'un nouveau client se connecte, ce fichier l'accueille et délague la gestion des événements aux **handlers** (`registerSocketHandlers`).

---

## 🔍 Décryptage du code

```typescript
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { registerSocketHandlers } from "./handlers";

// Récupération de l'URL du front-end (par défaut localhost:5173 pour Vite)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const configureWebSocket = (httpServer: HttpServer) => {
  // 1. Initialisation de l'instance Socket.io liée au serveur HTTP
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // 2. Écoute globale des connexions entrantes
  io.on("connection", (socket: Socket) => {
    // 3. Dès qu'un client se connecte, on lui branche ses écouteurs d'événements
    registerSocketHandlers(io, socket);
  });

  return io;
};
```
