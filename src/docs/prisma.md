# Mémo Prisma, Schéma & Repositories - Projet Echo

Ce document centralise les notions clés pour comprendre et utiliser Prisma ORM dans le projet Echo.

Il s'adresse notamment à un développeur qui découvre Prisma et explique progressivement :

ce qu'est un ORM ;

le rôle de schema.prisma ;

le rôle de Prisma Client ;

les migrations ;

la connexion à PostgreSQL ;

le typage automatique ;

la structure des Repositories ;

le fonctionnement des principales opérations CRUD ;

la différence entre Prisma, le schéma et la base de données.

1. 🧠 Prisma, c'est quoi ?

Prisma est un ORM (Object-Relational Mapping) pour TypeScript/JavaScript.

Un ORM permet de communiquer avec une base de données en utilisant du code plutôt que d'écrire directement du SQL dans toute l'application.

Par exemple, sans ORM, on pourrait écrire :

SELECT \* FROM users WHERE id = 42;

Avec Prisma :

const user = await prisma.user.findUnique({
where: {
id: 42,
},
});

Prisma se charge ensuite de traduire cet appel en requête SQL adaptée à PostgreSQL.

On peut donc voir Prisma comme un intermédiaire entre notre code TypeScript et PostgreSQL :

Notre code TypeScript
↓
Prisma Client
↓
SQL
↓
PostgreSQL

💡 Prisma ne remplace pas PostgreSQL. PostgreSQL reste la base de données. Prisma fournit une manière plus sûre et plus pratique de communiquer avec elle.

2. Les principaux éléments de Prisma

Dans un projet Prisma, plusieurs éléments jouent des rôles différents.

Prisma
│
├── schema.prisma
│ └── Décrit les modèles, relations et configuration
│
├── migrations/
│ └── Historique des modifications de la base
│
└── Prisma Client
└── API TypeScript permettant de communiquer avec la BDD

Les trois notions les plus importantes à retenir sont :

Élément

Rôle

schema.prisma

Décrit la structure de données attendue

prisma migrate

Permet de faire évoluer la structure de la BDD

PrismaClient

Permet à TypeScript de communiquer avec la BDD

3. 📄 À quoi sert schema.prisma ?

Le fichier schema.prisma est le fichier central de configuration et de description de Prisma.

Il contient notamment :

la connexion à la base de données ;

le générateur Prisma Client ;

les modèles de données ;

les relations entre les modèles ;

certains types et contraintes.

Exemple :

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

model User {
id Int @id @default(autoincrement())
email String @unique
name String?
createdAt DateTime @default(now())
}

On peut lire ce modèle comme :

"Je veux une entité User possédant un identifiant, un email unique, éventuellement un nom et une date de création."

4. 🔌 Le datasource

Cette partie :

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

indique à Prisma :

quelle technologie de base de données utiliser ;

où trouver les informations de connexion.

Ici :

provider = "postgresql"

signifie que notre base est PostgreSQL.

Et :

url = env("DATABASE_URL")

signifie que Prisma récupère l'URL de connexion dans une variable d'environnement.

Exemple dans .env :

DATABASE_URL="postgresql://user:password@localhost:5432/echo"

⚠️ Le fichier .env ne doit généralement pas être committé s'il contient des identifiants ou des secrets.

5. ⚙️ Le generator

Cette partie :

generator client {
provider = "prisma-client-js"
}

indique à Prisma de générer Prisma Client.

Prisma Client est la bibliothèque TypeScript que notre application va utiliser.

C'est notamment grâce à lui que nous pouvons écrire :

prisma.user.findMany();

ou :

prisma.message.create();

6. 🧱 Les model

Dans schema.prisma, un model représente généralement une table de la base de données.

Exemple :

model User {
id Int @id @default(autoincrement())
email String @unique
name String?
createdAt DateTime @default(now())
}

On peut simplifier la correspondance ainsi :

schema.prisma PostgreSQL

model User ──────────► table User
│
├── id ──────────► colonne id
├── email ──────────► colonne email
├── name ──────────► colonne name
└── createdAt ────────► colonne createdAt

Prisma va ensuite utiliser ce modèle pour générer les types et les méthodes disponibles dans Prisma Client.

7. 🔑 Les principaux attributs Prisma

Voici quelques attributs très courants.

@id

Indique que le champ est la clé primaire.

id Int @id

@default

Permet de définir une valeur par défaut.

id Int @id @default(autoincrement())

Ici, PostgreSQL générera automatiquement l'identifiant.

Autre exemple :

createdAt DateTime @default(now())

@unique

Indique qu'une valeur doit être unique.

email String @unique

Deux utilisateurs ne pourront donc pas avoir le même email.

?

Indique qu'un champ est optionnel / nullable.

name String?

Le champ name peut donc être NULL.

8. 🔗 Les relations entre les modèles

Prisma permet également de représenter les relations entre les données.

Exemple :

model User {
id Int @id @default(autoincrement())
email String @unique
messages Message[]
}

model Message {
id Int @id @default(autoincrement())
content String
userId Int

user User @relation(fields: [userId], references: [id])
}

On a ici une relation :

User
│
│ 1
│
│
│ N
▼
Message

Un utilisateur peut avoir plusieurs messages.

La clé étrangère est :

userId Int

Et Prisma sait que cette clé correspond à :

user User @relation(fields: [userId], references: [id])

9. 🧬 Prisma et le typage TypeScript

L'un des gros avantages de Prisma avec TypeScript est le typage généré automatiquement.

À partir du modèle :

model User {
id Int
email String
name String?
}

Prisma connaît notamment :

User.id → number
User.email → string
User.name → string | null

Ainsi, si on écrit :

const user = await prisma.user.findUnique({
where: {
id: "42",
},
});

TypeScript pourra signaler une erreur car id attend un number et non une string.

Il faut donc écrire :

const user = await prisma.user.findUnique({
where: {
id: 42,
},
});

💡 Prisma ne supprime pas tous les bugs possibles. Il garantit surtout que les opérations Prisma respectent les types et la structure qu'il connaît.

10. 🔄 schema.prisma → Prisma Client

Le fonctionnement général peut être résumé ainsi :

schema.prisma
│
│ prisma generate
▼
Prisma Client
│
▼
TypeScript connaît :

- les modèles
- les champs
- les types
- les relations
- les opérations disponibles

C'est ce qui permet à VS Code de proposer de l'autocomplétion lorsque l'on écrit :

prisma.user.

On peut alors obtenir des méthodes comme :

findMany()
findUnique()
findFirst()
create()
update()
delete()
count()

11. 🛠️ prisma generate

La commande :

npx prisma generate

ou avec pnpm :

pnpm prisma generate

demande à Prisma de générer ou régénérer Prisma Client à partir du schema.prisma.

En pratique, après une modification du schéma, il peut être nécessaire de régénérer le client pour que les nouveaux modèles/types soient disponibles dans TypeScript.

💡 Selon la version et la configuration de Prisma, la génération peut également être déclenchée automatiquement lors de certaines commandes comme les migrations.

12. 🏗️ Les migrations

Modifier schema.prisma ne signifie pas automatiquement que PostgreSQL a été modifié.

Par exemple, si on ajoute :

model User {
id Int @id @default(autoincrement())
email String @unique
}

Prisma connaît maintenant ce modèle, mais la table doit également exister dans PostgreSQL.

Pour créer une migration en développement :

pnpm prisma migrate dev --name create-user

Cette commande permet notamment de :

comparer le schéma avec l'état actuel de la base ;

générer une migration ;

appliquer cette migration à la base ;

mettre à jour Prisma Client si nécessaire.

On obtient généralement un dossier du type :

prisma/
├── schema.prisma
└── migrations/
└── 20260826120000_create-user/
└── migration.sql

13. 🧭 Schéma vs migration vs base de données

C'est une distinction importante pour débuter.

schema.prisma
│
│ décrit ce qu'on veut
▼
migration
│
│ explique comment modifier la BDD
▼
PostgreSQL
│
│ contient réellement les données
▼
tables / colonnes / relations

schema.prisma

Décrit la structure souhaitée.

migration.sql

Décrit les changements nécessaires pour passer d'une structure à une autre.

PostgreSQL

Contient réellement les tables et les données.

⚠️ Modifier uniquement schema.prisma ne suffit donc pas pour modifier une base de données existante.

14. 🗄️ À quoi sert le dossier config/ ?

Le dossier config/ regroupe tout ce qui configure l'application et ses connexions aux services extérieurs.

On peut le considérer comme la "salle des machines" de l'application.

Il sert principalement à :

Centraliser les instances : comme l'instance Prisma ;

Isoler les configurations globales ;

Centraliser les variables d'environnement ;

Configurer les loggers ;

Configurer d'autres services externes.

Exemple :

src/
└── config/
├── prisma.ts
└── env.ts

15. 🔌 Configuration et instance unique (src/config/prisma.ts)

Exemple classique :

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
prisma: PrismaClient | undefined;
};

export const prisma =
globalForPrisma.prisma ??
new PrismaClient({
log: ["query", "error", "warn"],
});

if (process.env.NODE_ENV !== "production") {
globalForPrisma.prisma = prisma;
}

Pourquoi faire cela ?

On souhaite généralement avoir une instance Prisma partagée dans l'application plutôt que de créer une nouvelle instance dans chaque Repository.

L'objectif est notamment d'éviter de multiplier inutilement les connexions et de limiter les problèmes lors du hot reload en développement.

On peut ensuite importer cette instance :

import { prisma } from "../config/prisma";

Et l'utiliser :

const users = await prisma.user.findMany();

💡 L'idée importante à retenir : une instance Prisma centralisée, utilisée par les différentes couches qui ont besoin d'accéder à la BDD.

16. 🏪 Pourquoi utiliser un Repository ?

Le Repository est la couche qui s'occupe de l'accès aux données.

Dans notre architecture :

Route
↓
Controller
↓
Client / Business Logic
↓
Repository
↓
Prisma
↓
PostgreSQL

Le Repository est donc l'endroit où l'on écrit les appels Prisma.

Par exemple :

export class UserRepository {
async findById(id: number) {
return prisma.user.findUnique({
where: {
id,
},
});
}

async findAll() {
return prisma.user.findMany();
}
}

17. 🎯 Pourquoi ne pas utiliser Prisma directement dans le Controller ?

On pourrait techniquement écrire :

async getUser(req: Request, res: Response) {
const user = await prisma.user.findUnique({
where: {
id: Number(req.params.id),
},
});

return res.json(user);
}

Mais cela mélange plusieurs responsabilités :

Controller
├── HTTP
└── Base de données

On préfère :

Controller
└── HTTP

Client
└── Business Logic

Repository
└── Base de données

Cela rend le code plus facile à maintenir et à tester.

18. 📦 Exemple complet d'un Repository

import { prisma } from "../config/prisma";

export class UserRepository {
async findAll() {
return prisma.user.findMany();
}

async findById(id: number) {
return prisma.user.findUnique({
where: {
id,
},
});
}

async findByEmail(email: string) {
return prisma.user.findUnique({
where: {
email,
},
});
}

async create(data: {
email: string;
name?: string;
}) {
return prisma.user.create({
data,
});
}

async update(id: number, data: {
email?: string;
name?: string;
}) {
return prisma.user.update({
where: {
id,
},
data,
});
}

async delete(id: number) {
return prisma.user.delete({
where: {
id,
},
});
}
}

Le Repository devient une interface entre le reste de l'application et Prisma.

19. 🧰 Les principales opérations CRUD avec Prisma

CRUD signifie :

C → Create
R → Read
U → Update
D → Delete

CREATE

Créer une donnée :

const user = await prisma.user.create({
data: {
email: "test@example.com",
name: "Camil",
},
});

READ - plusieurs résultats

const users = await prisma.user.findMany();

READ - un résultat par identifiant

const user = await prisma.user.findUnique({
where: {
id: 42,
},
});

READ - recherche selon une condition

const user = await prisma.user.findFirst({
where: {
email: "test@example.com",
},
});

UPDATE

const user = await prisma.user.update({
where: {
id: 42,
},
data: {
name: "Nouveau nom",
},
});

DELETE

await prisma.user.delete({
where: {
id: 42,
},
});

20. 🔎 findUnique, findFirst et findMany

Ces méthodes sont souvent confondues au début.

findUnique

Cherche une seule donnée grâce à un champ unique.

prisma.user.findUnique({
where: {
id: 42,
},
});

Le champ id est unique car il est @id.

Un email peut également être utilisé :

prisma.user.findUnique({
where: {
email: "test@example.com",
},
});

car :

email String @unique

findFirst

Retourne le premier résultat correspondant à une condition.

prisma.user.findFirst({
where: {
name: "Camil",
},
});

findMany

Retourne plusieurs résultats.

prisma.user.findMany({
where: {
name: "Camil",
},
});

Résumé :

Méthode

Résultat

findUnique()

Un résultat basé sur une valeur unique

findFirst()

Le premier résultat correspondant

findMany()

Plusieurs résultats

21. 📊 select : choisir les champs retournés

Prisma permet de sélectionner uniquement certains champs.

const user = await prisma.user.findUnique({
where: {
id: 42,
},
select: {
id: true,
email: true,
},
});

Le résultat ne contiendra pas les autres champs.

Cela peut être particulièrement utile lorsqu'on ne souhaite pas retourner certaines données.

Exemple classique : éviter de retourner un hash de mot de passe.

22. 🔗 include : récupérer les relations

Si User possède des Message, on peut demander à Prisma de récupérer également les messages.

const user = await prisma.user.findUnique({
where: {
id: 42,
},
include: {
messages: true,
},
});

Le résultat contiendra alors l'utilisateur ainsi que ses messages.

On peut visualiser cela comme :

User
├── id
├── email
└── messages
├── Message 1
├── Message 2
└── Message 3

23. 📄 Pagination

Lorsqu'une table contient beaucoup de données, il est déconseillé de récupérer tout le contenu avec :

prisma.user.findMany();

On peut utiliser take et skip.

const users = await prisma.user.findMany({
skip: 20,
take: 10,
});

Cela signifie :

skip = 20 → ignorer les 20 premiers
take = 10 → récupérer les 10 suivants

La pagination peut ensuite être utilisée par une API :

GET /users?page=3&limit=10

24. 🛡️ Où mettre la logique métier ?

Le Repository ne doit normalement pas décider ce que l'application doit faire.

Il doit surtout savoir comment récupérer ou modifier les données.

Exemple :

async findById(id: number) {
return prisma.user.findUnique({
where: { id },
});
}

Le Client peut ensuite appliquer une règle métier :

async getUser(id: number) {
const user = await this.userRepository.findById(id);

if (!user) {
throw new Error("User not found");
}

return user;
}

On sépare donc :

Repository
→ Comment récupérer l'utilisateur ?

Client
→ Que doit faire l'application si l'utilisateur n'existe pas ?

25. ❌ Erreur classique : mettre toute la logique dans le Repository

À éviter :

async findUser(id: number) {
const user = await prisma.user.findUnique({
where: { id },
});

if (!user) {
throw new Error("User not found");
}

if (user.email.endsWith("@admin.com")) {
// logique métier
}

return user;
}

Le Repository commence alors à connaître les règles de l'application.

On préfère :

Repository
→ récupère les données

Client
→ interprète et applique les règles métier

26. 🧩 Architecture complète du projet

Avec les différentes notions vues, on peut représenter le projet ainsi :

src/
│
├── config/
│ └── prisma.ts
│
├── routes/
│ └── user.routes.ts
│
├── controllers/
│ └── user.controller.ts
│
├── clients/
│ └── user.client.ts
│
├── repositories/
│ └── user.repository.ts
│
└── server.ts
│
▼
Prisma
│
├── schema.prisma
└── migrations/
│
▼
PostgreSQL

Le flux d'une requête est :

HTTP Request
│
▼
Route
│
▼
Controller
│
▼
Client
│
▼
Repository
│
▼
Prisma Client
│
▼
PostgreSQL

27. 🧠 FAQ - Questions importantes

Q : Est-ce que prisma.user.findMany() vient directement de ma table PostgreSQL ?

Pas directement.

user provient du modèle User défini dans schema.prisma.

Prisma génère ensuite une API TypeScript à partir de ce modèle.

schema.prisma
│
▼
model User
│
▼
Prisma Client
│
▼
prisma.user.findMany()

Prisma traduit ensuite cet appel en SQL exécuté contre PostgreSQL.

Q : Est-ce que le nom user vient du modèle User ?

Oui.

Avec :

model User {
id Int @id
}

Prisma Client expose généralement :

prisma.user

Pour :

model Message {
id Int @id
}

on aura :

prisma.message

Q : Pourquoi findMany() existe-t-il automatiquement ?

Parce que Prisma connaît le modèle.

Lorsqu'il voit :

model User {
id Int @id
}

il génère les opérations adaptées au modèle User.

C'est pourquoi on peut utiliser :

prisma.user.findMany();
prisma.user.findUnique(...);
prisma.user.create(...);
prisma.user.update(...);
prisma.user.delete(...);

Q : Est-ce que Prisma écrit le SQL à ma place ?

Oui.

Quand on écrit :

await prisma.user.findMany();

Prisma génère et exécute la requête SQL correspondante.

On peut activer les logs :

const prisma = new PrismaClient({
log: ["query", "error", "warn"],
});

pour observer les requêtes exécutées en développement.

Q : Est-ce que Prisma empêche toutes les erreurs de base de données ?

Non.

Prisma apporte beaucoup de sécurité au niveau du typage, mais il ne rend pas l'application infaillible.

Il peut toujours y avoir :

des erreurs de connexion ;

des contraintes SQL violées ;

des erreurs de logique métier ;

des problèmes de concurrence ;

des erreurs liées aux transactions ;

des données inattendues.

Il faut donc toujours gérer correctement les erreurs.

Q : Si je modifie schema.prisma, est-ce que PostgreSQL change automatiquement ?

Pas simplement parce que le fichier a changé.

En développement, on utilise généralement :

pnpm prisma migrate dev --name nom-de-la-migration

La migration permet d'appliquer les changements à la base.

Q : Pourquoi versionner le dossier migrations/ ?

Les migrations représentent l'historique des changements de structure de la base.

Elles doivent généralement être versionnées avec Git.

Ainsi, toute l'équipe partage le même historique :

Migration 1 → création des utilisateurs
Migration 2 → ajout de l'email
Migration 3 → ajout des messages
Migration 4 → ajout d'une relation

Cela permet notamment de reproduire la structure de la base dans différents environnements.

28. 📦 Que faut-il committer dans Git ?

Dans un projet Prisma, on versionne généralement :

prisma/
├── schema.prisma
└── migrations/

ainsi que le lockfile du gestionnaire de paquets :

pnpm-lock.yaml

Si package.json change, il doit également être committé.

En revanche, on ne commit généralement pas :

node_modules/
.env

Exemple de .gitignore :

node_modules/
.env
dist/

29. 🚀 Commandes Prisma essentielles

Avec pnpm :

Vérifier le schéma

pnpm prisma validate

Générer Prisma Client

pnpm prisma generate

Créer une migration en développement

pnpm prisma migrate dev --name nom-de-la-migration

Voir l'état des migrations

pnpm prisma migrate status

Ouvrir Prisma Studio

pnpm prisma studio

Prisma Studio permet d'explorer les données de la base avec une interface graphique.

30. 🧭 Workflow recommandé en développement

Lorsqu'on ajoute une nouvelle fonctionnalité nécessitant une modification de la base :

Étape 1 — Modifier schema.prisma

Exemple :

model User {
id Int @id @default(autoincrement())
email String @unique
}

Étape 2 — Créer la migration

pnpm prisma migrate dev --name create-user

Étape 3 — Vérifier la génération de Prisma Client

pnpm prisma generate

Étape 4 — Créer le Repository

export class UserRepository {
async findById(id: number) {
return prisma.user.findUnique({
where: { id },
});
}
}

Étape 5 — Utiliser le Repository dans le Client

const user = await this.userRepository.findById(id);

Étape 6 — Utiliser le Client dans le Controller

const user = await this.userClient.getUser(id);

31. 🧠 Les 5 choses à retenir

Si tu débutes avec Prisma, retiens surtout ceci :

1️⃣ schema.prisma

Décrit les modèles et relations utilisés par Prisma.

schema.prisma
→ description des données

2️⃣ Prisma Client

Permet au code TypeScript de communiquer avec PostgreSQL.

Prisma Client
→ API TypeScript

3️⃣ Migration

Permet de faire évoluer la structure réelle de la base.

Migration
→ changement de PostgreSQL

4️⃣ Repository

Centralise les accès à la base dans notre architecture.

Repository
→ Prisma
→ PostgreSQL

5️⃣ Client / Business Logic

Contient les règles métier.

Client
→ règles de l'application

32. 🏁 Résumé général

L'architecture du projet peut être résumée comme ceci :

                         APPLICATION
                              │
                              ▼
                         Controller
                         (HTTP)
                              │
                              ▼
                           Client
                      (Logique métier)
                              │
                              ▼
                         Repository
                       (Accès aux données)
                              │
                              ▼
                       Prisma Client
                       (ORM TypeScript)
                              │
                              ▼
                         PostgreSQL
                        (Base de données)

Et côté Prisma :

schema.prisma
│
├── Models
├── Relations
├── Types
└── Configuration
│
▼
Prisma Client
│
▼
Repositories
│
▼
PostgreSQL

La règle fondamentale à retenir est :

Le schema.prisma décrit la structure, les migrations font évoluer la base, Prisma Client permet de communiquer avec la base, le Repository encapsule ces accès et le Client contient la logique métier.

## FAQ & Questions / Réponses techniques

### Q : Le fait qu'on écrive `prisma.TABLE.méthode()`, ça vient directement de `schema.prisma` ?

**R :** Exactement ! À partir de ton fichier `schema.prisma` et de tes migrations, Prisma génère automatiquement un client TypeScript taillé sur mesure (le `@prisma/client`). C'est ce mécanisme qui fait que ton éditeur connaît le nom de tes tables (ex: `prisma.message`) et te propose toutes les méthodes CRUD adaptées (`findMany`, `create`, etc.) via l'autocomplétion (IntelliSense).

### Q : Avec le `schema.prisma`, est-ce qu'on a déjà le typage fait par défaut, ce qui évite les erreurs TypeScript ?

**R :** Oui, totalement. Le typage est entièrement géré en amont par Prisma. Si tu tentes d'utiliser un champ qui n'existe pas dans ton modèle ou de passer un mauvais format de données, TypeScript te renverra une erreur immédiatement avant même que tu ne lances ton serveur, t'évitant des bugs en production.
