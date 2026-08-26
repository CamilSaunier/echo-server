# 1. IMAGE DE BASE
# On choisit l'image officielle Node.js 22 sur Alpine Linux (très légère).
FROM node:22-alpine3.20

# 2. ACTIVATION DE PNPM
# On configure le dossier de pnpm et on l'active via Corepack (intégré à Node.js).
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 3. DOSSIER DE TRAVAIL
# On crée et on se place dans le dossier /app à l'intérieur du conteneur.
WORKDIR /app

# 4. OPTIMISATION DU CACHE DOCKER
# On copie d'abord uniquement les fichiers de dépendances.
COPY package.json pnpm-lock.yaml ./

# 5. INSTALLATION DES DÉPENDANCES
# En dev, on installe tout (y compris les outils de dev comme TypeScript ou tsx).
RUN pnpm install

# 6. COPIE DU CODE SOURCE
# On copie l'intégralité du code du projet dans le conteneur.
COPY . .

# -----------------------------------------------------------
# 6.5. GÉNÉRATION DU CLIENT PRISMA
# Prisma a besoin du fichier schema.prisma qu'on vient de 
# copier juste au-dessus pour générer les types TypeScript.
# -----------------------------------------------------------
RUN pnpm prisma generate

# 7. PORT DU SERVEUR
# On indique que le serveur backend écoute sur le port 4000.
EXPOSE 4000

# 8. COMMANDE DE DÉMARRAGE (DEV)
# On lance la commande "pnpm dev", qui exécute le serveur avec rechargement
# automatique à chaque modification de fichier (Hot Reload).
CMD ["pnpm", "dev"]