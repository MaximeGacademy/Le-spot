# Notes formateur — Le Spot (J3-J4)

> Document **formateur uniquement**. Ne pas distribuer aux étudiants : il révèle l'emplacement des failles plantées volontairement (matière pour J5-J6).

## Où vivent les choses (carte rapide)

- Lecture des données (Server Components) : `src/app/page.tsx`, `src/app/mes-reservations/page.tsx`, `src/app/admin/page.tsx`, `src/app/terrains/[id]/page.tsx`.
- Écriture des données (Server Actions) : `src/app/actions/bookings.ts`, `src/app/actions/courts.ts`, `src/app/actions/auth.ts`.
- Îlot client : `src/components/slot-button.tsx` (modale + déclenchement de l'action), `src/components/filters.tsx` (filtres → URL).
- Clients Supabase : `src/lib/supabase/{client,server,proxy}.ts`.
- Session : `src/proxy.ts` (l'ancien "middleware", voir plus bas).
- Schéma + données : `supabase/migrations/0001_init.sql`, `supabase/seed.sql`.

## Deux écarts par rapport au brief (à signaler, §11)

1. **`middleware.ts` → `src/proxy.ts`.** Depuis **Next.js 16**, le middleware est renommé "proxy" (même rôle). On a suivi la convention courante. À mentionner en J3 quand on parle de session.
2. **shadcn = preset "base-nova" (composants sur Base UI, pas Radix).** Au scaffolding, `shadcn init` installe désormais des composants basés sur `@base-ui/react`. Conséquences visibles dans le code : pas de `asChild` sur `<Button>` mais une prop `render` ; `<Dialog>`/`<Select>` ont une API Base UI. Les filtres et formulaires utilisent des `<select>` natifs (plus simples à lire). Rien à corriger : c'est juste à savoir pour répondre aux questions.

---

## Les 5 faiblesses VOLONTAIRES (§6) — NE PAS corriger

### 1. Aucune garde anti double-booking

- **Côté base** : `supabase/migrations/0001_init.sql` — la table `bookings` n'a **aucune contrainte d'unicité** sur `(court_id, date, start_hour)`.
- **Côté appli** : `src/app/actions/bookings.ts` → `createBooking()` insère sans vérifier qu'un créneau identique existe déjà.
- **Preuve** : réserver deux fois le même terrain/jour/heure (avec le même compte ou deux comptes) → les deux `insert` passent. À vérifier en base : `select court_id, date, start_hour, count(*) from bookings group by 1,2,3 having count(*) > 1;`
- **En J5-J6** : contrainte `unique` + vérification dans l'action (puis la bascule 60/120 min transforme ça en détection de chevauchement d'intervalles → test rouge/vert).

### 2. RLS désactivée

- **Côté base** : `0001_init.sql` n'appelle **jamais** `alter table … enable row level security`. La RLS est donc **OFF** sur `profiles`, `courts` et `bookings`. Comme Supabase accorde par défaut les privilèges aux rôles `anon`/`authenticated`, **tout est lisible/modifiable avec la seule clé anon**.
- **Côté appli** : `createBooking`/`cancelBooking` n'ont pas besoin de plus pour fonctionner… mais rien n'isole les données par utilisateur.
- **Preuve** : connecté en client A, lire les réservations d'un client B (ex. dans `mes-reservations`, retirer le filtre `.eq("user_id", …)` mentalement → l'API renverrait tout). Ou directement : avec la clé anon, `supabase.from('bookings').select('*')` renvoie **toutes** les lignes.

### 3. `cancelBooking` ne vérifie pas le propriétaire

- **Fichier** : `src/app/actions/bookings.ts` → `cancelBooking()` fait `update … eq("id", id)` **sans** `.eq("user_id", user.id)` ni contrôle. N'importe quel compte connecté peut annuler la réservation de n'importe qui (id deviné/incrémental).
- **Preuve** : se connecter en client A, appeler l'action avec l'`id` d'une réservation de B → elle passe en `annulee`.

### 4. Action admin non gardée côté serveur

- **Fichier** : `src/app/actions/courts.ts` → `createCourt` / `updateCourt` / `deleteCourt` ne **revérifient jamais** le rôle.
- L'UI masque seulement le lien (`src/components/site-nav.tsx`) et la **page** `/admin` bloque l'affichage (`src/app/admin/page.tsx` : `if (profile?.role !== "admin")`). Mais **la page ≠ l'action**.
- **Preuve** : depuis un compte client (non admin), invoquer directement l'action (POST sur l'endpoint de la Server Action, ou un petit `<form action={deleteCourt}>` collé dans un composant) → la suppression passe.

### 5. Aucune validation d'entrée sur la réservation

- **Fichier** : `src/app/actions/bookings.ts` → `createBooking()` prend `court_id`, `date`, `start_hour` bruts du `FormData`, **sans valider** : date dans le passé, `start_hour` hors plage 9-21, terrain inexistant/inactif. (Le `CHECK (start_hour between 9 and 21)` en base est le seul garde-fou, et il est contournable côté logique métier "date passée".)
- **Preuve** : forger un POST avec `start_hour=3` (rejeté par le CHECK DB → bonne occasion de parler des deux niveaux) ou `date` d'hier (accepté !).

### Bonus — frontière des secrets (à mettre en scène)

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` est **envoyée au navigateur** (préfixe `NEXT_PUBLIC_`). C'est voulu : elle est *censée* être protégée par la RLS… qui est OFF (faille 2). On peut la lire dans l'onglet Réseau / le bundle JS.
- `SUPABASE_SERVICE_ROLE_KEY` (dans `.env.local.example`) n'a **pas** ce préfixe → reste côté serveur. C'est la clé "nucléaire" : à ne JAMAIS exposer. L'app naïve ne l'utilise pas ; elle sert d'exemple de la frontière.
- Message clé : sans RLS, la clé anon suffit à tout faire. La sécurité Supabase **repose** sur la RLS.

---

## Démo "prouver les failles" (script rapide)

> ✅ **Confirmé le 2026-06-05** sur le projet de démo (`ijwhsgjsmbsbctsuyiag`), avec la seule clé **anon**, via l'API REST `…/rest/v1/…` (= ce qu'un navigateur peut faire). Les 5 failles sont réelles.

1. **Double-booking** : 2× POST sur `bookings` avec le même `(court_id, date, start_hour)` → 2 lignes créées. *(Confirmé.)*
2. **RLS off (lecture)** : `GET /rest/v1/bookings` en anon → renvoie **toutes** les réservations de tous les comptes. *(Confirmé.)*
3. **Annulation croisée** : `PATCH /rest/v1/bookings?id=eq.1 {"status":"annulee"}` en anon → passe, sans être propriétaire. *(Confirmé.)*
4. **Action admin non gardée** : `POST /rest/v1/courts` en anon (aucun rôle) → terrain créé. *(Confirmé.)*
5. **Validation absente** : `POST /rest/v1/bookings` avec `date` = 2020-01-01 → accepté. *(Confirmé.)* En revanche `start_hour = 3` est rejeté par le **CHECK** DB → bon exemple des **deux niveaux** de défense (appli vs base).

Variante "depuis l'app" (à montrer en cours) : ouvrir le DevTools → onglet Réseau pendant une réservation pour voir partir l'appel ; lire la clé anon dans le bundle ; appeler une Server Action sans le rôle attendu.

### Comptes de démo (projet de cours)

- `client@lespot.test` / `motdepasse` (rôle `client`)
- `admin@lespot.test` / `motdepasse` (rôle `admin`)
