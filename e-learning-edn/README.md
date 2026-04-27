# E-Learning EDN — Frontend

Application React de e-learning pour l'EDN (École Du Numérique).

## Stack technique

| Outil | Version |
|-------|---------|
| React | 19 |
| TypeScript | 5.8 |
| Vite | 7 |
| React Router DOM | 7 |
| Tailwind CSS | 4 |
| shadcn/ui (Radix UI) | — |
| Axios | 1.12 |
| @dnd-kit/core + sortable | — |

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
# → http://localhost:5173
```

Le backend doit tourner sur `http://localhost:3000`.

## Variables d'environnement

```env
VITE_BACKEND_URL=http://localhost:3000
```

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| User | usertest@ccir-campus.re | erer |
| Admin | admin@ccir-campus.re | erer |

---

## Historique des modifications

### Session 3 — Toutes les améliorations (2026-04-06)

**1. Persistance des scores de quiz**
- `pages/Quizz.tsx` : Appel à `submitQuiz()` après validation → score et résultat sauvegardés en base via `POST /quizz/:id/submit`
- `pages/Badges.tsx` : Affichage de l'historique complet des tentatives (score, résultat, date) + badges par formation (meilleur score)

**2. Suivi de progression par module**
- `pages/Module.tsx` : Appel automatique à `markModuleVisited()` à chaque visite d'un module
- `components/template/sidebar.tsx` : Coche verte ✓ sur les modules visités + barre de progression par formation
- Barre de progression dans le module (module X / total)

**3. Réordonner les modules (drag-and-drop)**
- `components/edit-template/form-module.tsx` : Tableau drag-and-drop avec `@dnd-kit/sortable` — glisser les lignes pour réordonner
- Appel à `reorderModules()` après chaque déplacement → persiste en base (champ `order`)

**4. Loading skeletons**
- `components/ui/skeleton.tsx` : Composants `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonTableRow`
- Utilisés dans : `Quizz.tsx`, `Module.tsx`, `Badges.tsx`, `formation-tab.tsx`, `user-tab.tsx`

**5. Pagination admin**
- `components/tab/formation-tab.tsx` : Pagination 10 éléments/page avec navigation
- `components/tab/user-tab.tsx` : Pagination identique

**6. Confirmation de logout**
- `components/template/sidebar.tsx` : Dialog de confirmation avant déconnexion (`AlertDialog`)

**7. Feedback visuel détaillé sur le quiz**
- `pages/Quizz.tsx` : Après soumission, correction question par question — réponse choisie, bonne réponse, coloration verte/rouge
- Résumé du score avec score global en haut

**8. Seuil de réussite configurable par quiz**
- `components/edit-template/form-quizz.tsx` : Slider 50%–100% pour définir le seuil (défaut 80%)
- `pages/Quizz.tsx` : Utilise `quiz.passThreshold` au lieu du 80% hardcodé

---

### Session 2 — Corrections de bugs (2026-04-06)

**Bug Quiz — "Un quizz existe déjà"**
- `form-quizz.tsx` : État local `localQuiz` pour router correctement vers PUT après le premier enregistrement

**Bug Module — image/vidéo obligatoires**
- Champs `video` et `image` maintenant optionnels (schéma Prisma + migration SQL)

---

### Session 1 — Refactoring général (2026-04-06)

**État global** — `AuthContext.tsx` avec `useAuth()`, suppression du prop drilling  
**Auto-logout 401** — Intercepteur Axios  
**Cache API** — TTL 60s sur formations/modules/quiz  
**Normalisation** — Champs français → anglais dans les types et composants  
**Gestion d'erreur** — `ApiResult<T>` unifié  
**Validation** — Messages d'erreur par champ sur Login/Register  

---

## Améliorations restantes

| Amélioration | Complexité |
|-------------|-----------|
| Upload direct images/vidéos (Cloudinary/Supabase) | Élevée (service externe) |
| Tests unitaires et d'intégration | Moyenne |
| Mode hors-ligne / PWA | Élevée |
| Certificats de formation téléchargeables | Moyenne |
