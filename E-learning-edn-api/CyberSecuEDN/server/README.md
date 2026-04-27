# E-Learning EDN — Backend API

API REST Node.js/Express pour l'application e-learning EDN.

## Stack technique

| Outil | Version |
|-------|---------|
| Node.js | 22 |
| Express | 4 |
| Prisma ORM | 5 |
| PostgreSQL | 15 |
| jsonwebtoken | 9 |
| bcrypt | 6 |
| Helmet / CORS | — |
| Docker / Docker Compose | — |

## Démarrage

```bash
docker compose up --build -d
# API → http://localhost:3000
# PostgreSQL → localhost:5432
```

Au démarrage : migrations → seed → serveur.

## Variables d'environnement (`.env`)

```env
DATABASE_URL=postgresql://user:password@db:5432/cybersecuedn
JWT_SECRET=token          # À changer en production !
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=cybersecuedn
```

## Comptes créés au seed

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@ccir-campus.re | erer |
| UserTest | usertest@ccir-campus.re | erer |

Les emails doivent appartenir au domaine `@ccir-campus.re`.

---

## Endpoints

### Auth
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/auth/register` | — | Créer un compte |
| POST | `/auth/login` | — | Connexion (retourne JWT) |
| GET | `/auth/me` | ✅ Token | Profil connecté |

### Formations
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/formations` | Lister |
| GET | `/formations/:id` | Détail |
| GET | `/formations/:id/modules` | Modules (triés par `order`) |
| GET | `/formations/:id/quizz` | Quiz |
| POST | `/formations` | Créer |
| PUT | `/formations/:id` | Modifier |
| DELETE | `/formations/:id` | Supprimer |

### Modules
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/modules` | Lister |
| GET | `/modules/:id` | Détail |
| POST | `/modules` | Créer |
| PUT | `/modules/reorder` | Réordonner `{ orderedIds: [1,2,3] }` |
| PUT | `/modules/:id` | Modifier |
| DELETE | `/modules/:id` | Supprimer |

### Quiz
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/quizz` | — | Lister |
| GET | `/quizz/:id` | — | Détail |
| GET | `/quizz/formation/:id` | — | Quiz d'une formation |
| POST | `/quizz` | — | Créer ou mettre à jour (upsert) |
| PUT | `/quizz/:id` | — | Modifier |
| DELETE | `/quizz/:id` | — | Supprimer |
| POST | `/quizz/:id/submit` | ✅ Token | Soumettre le score → sauvegarde la tentative |
| GET | `/quizz/attempts/me` | ✅ Token | Mes tentatives |

### Progression
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/progress` | ✅ Token | Marquer un module comme vu `{ moduleId, formationId }` |
| GET | `/progress/me` | ✅ Token | Ma progression |

### Utilisateurs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users` | Lister |
| GET | `/users/:id` | Détail |
| POST | `/users` | Créer |
| PUT | `/users/:id` | Modifier |
| DELETE | `/users/:id` | Supprimer |

---

## Schéma de base de données

### Modèles

**User** — `id, email, password, role, createdAt`  
**Formation** — `id, titre, isActive`  
**Module** — `id, id_formation, titre, sousTitre, texte, video?, image?, order`  
**Quizz** — `id, id_formation, titre, contenu (JSON), passThreshold`  
**QuizAttempt** — `id, userId, quizId, formationId, score, passed, createdAt`  
**UserProgress** — `id, userId, moduleId, formationId, viewedAt` (unique sur userId+moduleId)

---

## Historique des modifications

### Session 3 — Nouvelles fonctionnalités (2026-04-06)

**Persistance des scores de quiz**
- Nouveau modèle `QuizAttempt` (userId, quizId, formationId, score, passed, createdAt)
- Nouveaux fichiers : `models/attemptModel.js`, route `POST /quizz/:id/submit` (auth requise)
- Route `GET /quizz/attempts/me` pour récupérer l'historique de l'utilisateur connecté

**Suivi de progression par module**
- Nouveau modèle `UserProgress` (userId, moduleId, formationId, viewedAt) avec contrainte UNIQUE
- Nouveaux fichiers : `models/progressModel.js`, `routes/progress.js`
- Routes : `POST /progress` (upsert visite) et `GET /progress/me`

**Ordre des modules (drag-and-drop)**
- Champ `order Int @default(0)` ajouté sur `Module`
- `getModulesByFormation` trie maintenant par `order`
- Route `PUT /modules/reorder` : accepte `{ orderedIds: [1,2,3] }` et met à jour les `order`

**Seuil de réussite configurable**
- Champ `passThreshold Int @default(80)` ajouté sur `Quizz`
- Retourné dans toutes les réponses quiz, persisté à la création/modification

**Qualité code**
- Suppression du `console.log` de debug dans `formationModel.js`
- Unification de `prisma` dans les routes qui en avaient besoin

---

### Session 2 — Corrections de bugs (2026-04-06)

**Module — video/image non-nullables**
- `video String?` et `image String?` dans le schéma + migration `DROP NOT NULL`

**Quiz — POST retournait 400 si quiz existait déjà**
- `POST /quizz` transformé en upsert

---

## Améliorations restantes (priorité production)

| Priorité | Amélioration |
|----------|-------------|
| Critique | Appliquer `authenticateToken` sur toutes les routes admin |
| Critique | Remplacer `JWT_SECRET=token` par une valeur secrète |
| Haute | Relations Prisma `@relation` + `onDelete: Cascade` |
| Haute | Validation des entrées avec Zod |
| Moyenne | Refresh token + durée de vie configurable |
| Moyenne | Swagger / OpenAPI |
| Faible | Instance PrismaClient partagée (au lieu d'une par fichier) |
| Faible | `updatedAt` sur Formation, Module, Quizz |
