# 🎾 Le Spot — réservation de terrains de padel

Petite app de réservation de padel, support du module **J3-J4 « Ouvrir le capot »** (bootcamp Alegria, vibe coding).

Stack : **Next.js 16 (App Router)** · **TypeScript** · **React 19** · **Tailwind CSS v4** · **shadcn/ui** · **Supabase** (Postgres + Auth).

> ⚠️ Cette app est un **support pédagogique**, pas un produit. Elle contient des faiblesses volontaires (sécurité) qui serviront de matière au module suivant. Ne l'utilise pas telle quelle en production.

---

## Prérequis

- **Node.js 20+** et npm
- Un compte **Supabase** (gratuit) : <https://supabase.com>

## 1. Récupérer le projet et installer

```bash
git clone <url-du-repo> le-spot
cd le-spot
npm install
```

## 2. Créer ton projet Supabase

1. Sur <https://supabase.com/dashboard>, **New project**. Choisis un nom (ex. `le-spot`) et une région proche.
2. Note le mot de passe de la base (tu peux le laisser de côté pour ce TP).

## 3. Créer les tables (migration)

Dans le dashboard Supabase → **SQL Editor** → **New query**, colle le contenu de
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) et clique **Run**.

Cela crée les tables `profiles`, `courts`, `bookings` et le trigger qui crée un profil à chaque inscription.

## 4. Remplir quelques terrains (seed)

Toujours dans le **SQL Editor**, colle et exécute le bloc « 5 terrains » de
[`supabase/seed.sql`](supabase/seed.sql).

## 5. Renseigner les variables d'environnement

Copie le modèle puis remplis-le :

```bash
cp .env.local.example .env.local
```

Dans le dashboard Supabase → **Project Settings → API**, récupère :

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key (secrète, ne la partage pas) → `SUPABASE_SERVICE_ROLE_KEY`

> Les variables `NEXT_PUBLIC_*` sont envoyées **au navigateur**. La clé `service_role` n'a **pas** ce préfixe : elle reste côté serveur.

## 6. Lancer l'app

```bash
npm run dev
```

Ouvre <http://localhost:3000> : tu arrives sur le **planning du jour**.

## 7. Comptes de démo (pour tester)

1. Sur la page **/login**, crée un compte (ex. `client@lespot.test`). Il aura le rôle `client` par défaut.
2. Pour un compte **admin** : crée un deuxième compte (ex. `admin@lespot.test`), puis dans le SQL Editor exécute :

   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'admin@lespot.test');
   ```

3. (Optionnel) Pour que le planning ne soit pas vide, ajoute quelques réservations avec l'`id` de ton compte client :

   ```sql
   insert into bookings (court_id, user_id, date, start_hour, status)
   values
     (1, (select id from auth.users where email = 'client@lespot.test'), current_date, 10, 'confirmee'),
     (2, (select id from auth.users where email = 'client@lespot.test'), current_date, 14, 'confirmee');
   ```

## 8. Déployer sur Vercel

1. Pousse le repo sur GitHub.
2. Sur <https://vercel.com>, **Import Project** → sélectionne le repo.
3. Dans **Environment Variables**, recopie les 3 variables de ton `.env.local`.
4. **Deploy**. Vercel détecte Next.js automatiquement.

---

## Les écrans

| Écran | Route | Accès |
|---|---|---|
| Planning du jour | `/` | public |
| Détail d'un terrain | `/terrains/[id]` | public |
| Mes réservations | `/mes-reservations` | connecté |
| Admin (CRUD terrains) | `/admin` | rôle admin |
| Connexion / inscription | `/login` | public |

## Structure (l'essentiel)

```
src/
├─ app/
│  ├─ page.tsx                 vue du jour (Server Component)
│  ├─ terrains/[id]/page.tsx   détail (route dynamique)
│  ├─ mes-reservations/page.tsx route protégée
│  ├─ admin/page.tsx           CRUD terrains
│  ├─ login/page.tsx           auth
│  └─ actions/                 Server Actions (bookings, courts, auth)
├─ components/                 day-view, slot-button, filters, date-nav, ui/ (shadcn)
├─ lib/
│  ├─ supabase/                client (navigateur), server, proxy (session)
│  ├─ types.ts                 types TS (unions miroir des CHECK SQL)
│  └─ dates.ts
└─ proxy.ts                    rafraîchit la session (ex-"middleware", renommé en Next.js 16)
```

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm start       # lancer le build
npm run lint    # ESLint
```

---

> Le dossier `cours/` et le fichier `CLAUDE.md` sont des **contenus formateur** : ils ne font pas partie de ce que reçoivent les étudiants (à retirer avant distribution).
# Le-spot
