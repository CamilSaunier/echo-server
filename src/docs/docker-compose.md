# Guide Docker — Projet Echo

Ce document résume comment utiliser Docker sur ce projet, notamment après l'ajout d'une nouvelle dépendance.

---

## ⚡ Après chaque ajout de dépendance

C'est LA chose à retenir. Deux étapes, dans cet ordre :

```bash
# 1. Tu ajoutes la dépendance dans package.json
pnpm add <nom-du-package>
# ou pour une dépendance de dev :
pnpm add -D <nom-du-package>

# 2. Tu redémarres le conteneur pour resynchroniser node_modules
docker compose restart echo-server
```

**Pourquoi ça suffit ?**
Le `command` du service `echo-server` dans `docker-compose.yml` exécute `pnpm install && pnpm dev` à chaque démarrage du conteneur. Le `pnpm install` va donc automatiquement voir la nouvelle ligne dans `package.json` et installer le package manquant dans le volume `pnpm_modules`, avant de relancer le serveur.

> ⚠️ **Piège à éviter :** ne pas confondre "redémarrer le conteneur" et "hot-reload". Le hot-reload de `tsx watch` recharge ton _code_ automatiquement à chaque sauvegarde de fichier, mais il ne réinstalle jamais de packages. Si tu ajoutes une dépendance et que tu te contentes de sauvegarder un fichier, ça ne suffira pas — il faut bien `docker compose restart echo-server`.

### Cas où `restart` ne suffit pas → il faut rebuild

Si tu touches au `Dockerfile` lui-même (nouvelle version de Node, nouvel outil système, etc.), ou si tu veux repartir sur une image totalement propre :

```bash
docker compose up --build
```

---

## 🧠 Pourquoi ce fonctionnement (contexte / rappel)

- `.:/app` → monte tout ton code source dans le conteneur en temps réel (édition locale = visible instantanément dans le conteneur).
- `pnpm_modules:/app/node_modules` → volume Docker **persistant**, séparé de ton dossier local, qui stocke les dépendances installées. Il survit aux redémarrages, mais peut devenir "périmé" par rapport à ton `package.json`.
- `command: sh -c "pnpm install && pnpm dev"` → à chaque démarrage du conteneur, on force la resynchronisation de ce volume avec `package.json`, avant de lancer le serveur en mode dev.

En clair : **ton code se met à jour tout seul (hot-reload), tes dépendances se mettent à jour au redémarrage du conteneur.**

---

## 📋 Récap des commandes Docker du projet

| Situation                                              | Commande                                               | Effet                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Premier lancement du projet                            | `docker compose up`                                    | Build les images si besoin + démarre tous les services                  |
| Lancement en arrière-plan                              | `docker compose up -d`                                 | Pareil, mais rend la main dans le terminal                              |
| **Ajout d'une dépendance npm/pnpm**                    | `docker compose restart echo-server`                   | Relance le conteneur → `pnpm install` resynchronise `node_modules`      |
| Modification du `Dockerfile`                           | `docker compose up --build`                            | Rebuild l'image avant de redémarrer                                     |
| Rebuild complet sans cache (en cas de gros doute)      | `docker compose build --no-cache && docker compose up` | Reconstruit l'image de zéro, ignore le cache Docker                     |
| Arrêter les conteneurs                                 | `docker compose down`                                  | Stoppe et supprime les conteneurs (les volumes nommés restent)          |
| Arrêter + supprimer les volumes (⚠️ reset la DB aussi) | `docker compose down -v`                               | Supprime aussi `postgres_data` et `pnpm_modules`                        |
| Voir les logs en direct                                | `docker compose logs -f echo-server`                   | Affiche les logs du serveur en continu                                  |
| Ouvrir un shell dans le conteneur                      | `docker compose exec echo-server sh`                   | Utile pour debug, lancer des commandes à la main                        |
| Lister les volumes existants                           | `docker volume ls`                                     | Pour retrouver le vrai nom d'un volume (ex: `echo-server_pnpm_modules`) |
| Supprimer un volume précis                             | `docker volume rm <nom_du_volume>`                     | Si tu veux vider `node_modules` sans toucher à la DB                    |
| Voir les conteneurs actifs                             | `docker compose ps`                                    | Vérifie que tout tourne bien                                            |

---

## 🩺 Petit arbre de décision en cas de souci

```
Un package "Cannot find module" au démarrage ?
│
├── Tu viens d'ajouter la dépendance dans package.json ?
│   └── OUI → docker compose restart echo-server
│
├── Tu as touché le Dockerfile ?
│   └── OUI → docker compose up --build
│
└── Rien de tout ça n'a marché ?
    └── docker compose down -v && docker compose up --build
        (reset complet : volumes + rebuild sans cache)
```

---

## ✅ Bon réflexe général

Avant de te dire "Docker est cassé", demande-toi toujours :

1. Est-ce que j'ai juste modifié du code ? → rien à faire, le hot-reload s'en charge.
2. Est-ce que j'ai touché `package.json` ? → `docker compose restart echo-server`.
3. Est-ce que j'ai touché le `Dockerfile` ? → `docker compose up --build`.
4. Toujours un souci bizarre ? → reset complet avec `down -v` puis `up --build`.

Dans 90% des cas sur ce projet, le problème vient du volume `pnpm_modules` qui n'est pas à jour — pas d'un vrai bug Docker.
