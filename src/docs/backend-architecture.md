🏛️ Architecture Backend - Projet Echo

Ce document détaille les choix architecturaux, l'organisation des dossiers et les responsabilités des différentes couches de notre API backend (TypeScript, Express, Prisma, PostgreSQL).

1. Principes Directeurs

Séparation des responsabilités : Chaque couche a un rôle unique et bien défini. Pas de logique métier dans les routes, pas de requêtes SQL directes dans les contrôleurs.

Programmation Orientée Objet (POO) : Utilisation de classes pour structurer les Repositories et les Clients, facilitant la maintenabilité et la lisibilité.

Sécurité des types : Utilisation stricte de TypeScript et de Prisma pour garantir une robustesse maximale de la base de données au code HTTP.

2. Arborescence du Projet (src/)

L'architecture repose sur un découpage strict en 3 couches (Layers) :

src/
├── config/ # Configurations globales (ex: instance Prisma, variables d'env)
├── controllers/ # Gestion des requêtes/réponses HTTP (statuts, req/res)
├── clients/ # Logique métier et règles de gestion (couche intermédiaire)
├── repositories/ # Accès direct à la base de données via Prisma (CRUD)
├── routes/ # Définition des routes de l'API Express
└── server.ts # Point d'entrée et initialisation du serveur

3. Le Modèle des 3 Couches (Controller ➔ Client ➔ Repository)

Le flux d'une requête HTTP suit toujours le même sens rigoureux :

1. La Couche Routes (routes/)

Rôle : Définir les endpoints de l'API et associer les routes aux contrôleurs.

Ce qu'elle fait : Déclare les méthodes HTTP, les chemins et éventuellement les middlewares.

Ce qu'elle ne fait pas : Aucune logique métier et aucun accès direct à la base de données.

2. La Couche Controllers (controllers/)

Rôle : Gérer l'aspect HTTP pur.

Ce qu'elle fait : Récupère les données de la requête (req.body, req.params, etc.), appelle le Client pour faire le travail et renvoie la réponse HTTP (res.status(200).json(...)).

Ce qu'elle ne fait pas : Aucune logique métier et aucune requête directe en base de données.

3. La Couche Clients / Business Logic (clients/)

Rôle : Porter toute la logique métier de l'application.

Ce qu'elle fait : Traite les données, applique les règles de gestion (ex. vérifier si un utilisateur a le droit de faire une action, formater des données, combiner plusieurs appels).

Ce qu'elle ne fait pas : Ne gère ni le HTTP (req/res) ni directement Prisma. Elle communique avec les Repositories.

4. La Couche Repositories (repositories/)

Rôle : Communiquer directement avec la base de données.

Ce qu'elle fait : Exécute les requêtes via Prisma (prisma.model.findMany(), prisma.model.create(), etc.).

Ce qu'elle ne fait pas : Aucune logique métier et aucun code HTTP.

4. Flux d'une requête

Client HTTP
│
▼
Routes
│
▼
Controller
│
▼
Client / Business Logic
│
▼
Repository
│
▼
Prisma
│
▼
PostgreSQL

Chaque couche communique uniquement avec la couche qui lui est destinée.

Règle importante : on évite de contourner une couche. Un Controller ne doit pas appeler directement Prisma et un Repository ne doit pas connaître req ou res.

5. Exemple concret

Pour un endpoint permettant de récupérer un utilisateur :

GET /users/:id

Route

router.get("/users/:id", userController.getUser);

La route se contente de connecter l'endpoint au contrôleur.

Controller

async getUser(req: Request, res: Response) {
const userId = Number(req.params.id);

const user = await userClient.getUser(userId);

return res.status(200).json(user);
}

Le Controller s'occupe uniquement de transformer la requête HTTP en appel métier, puis de transformer le résultat en réponse HTTP.

Client

async getUser(userId: number) {
const user = await this.userRepository.findById(userId);

if (!user) {
throw new Error("User not found");
}

return user;
}

Le Client applique ici la règle métier : un utilisateur qui n'existe pas doit être considéré comme introuvable.

Repository

async findById(userId: number) {
return prisma.user.findUnique({
where: {
id: userId,
},
});
}

Le Repository est le seul élément qui connaît directement Prisma et la manière dont les données sont récupérées en base.

6. Responsabilités résumées

Couche

Responsabilité principale

Connaît HTTP ?

Connaît Prisma ?

Routes

Définir les endpoints

Oui

Non

Controller

Gérer req/res

Oui

Non

Client

Logique métier

Non

Non

Repository

Accès aux données

Non

Oui

Prisma

Communication avec PostgreSQL

Non

—

PostgreSQL

Stockage des données

Non

—

7. Règles à respecter

✅ À faire

Garder les Controllers simples.

Mettre les règles métier dans les Clients.

Centraliser les accès à la base dans les Repositories.

Utiliser Prisma uniquement dans la couche Repository.

Garder les Routes responsables uniquement du routage et des middlewares.

Utiliser TypeScript strictement.

Donner des responsabilités claires aux classes.

❌ À éviter

// ❌ Controller qui utilise Prisma directement
async getUser(req: Request, res: Response) {
const user = await prisma.user.findUnique({
where: { id: Number(req.params.id) },
});

return res.json(user);
}

// ❌ Repository qui contient de la logique métier
async findUser(userId: number) {
const user = await prisma.user.findUnique({
where: { id: userId },
});

if (!user) {
// ❌ La règle métier ne devrait pas être ici
throw new Error("User not found");
}

return user;
}

8. Objectif de l'architecture

L'objectif principal est de rendre chaque partie de l'application :

Lisible : on sait immédiatement où chercher une fonctionnalité.

Maintenable : une modification de la base ne doit pas nécessiter de modifier les Controllers.

Testable : chaque couche peut être testée indépendamment.

Évolutive : la logique métier reste indépendante du framework HTTP et de la technologie de base de données.

En résumé :

HTTP
↓
Controller
↓
Business Logic
↓
Repository
↓
Prisma
↓
PostgreSQL

Une couche = une responsabilité.
