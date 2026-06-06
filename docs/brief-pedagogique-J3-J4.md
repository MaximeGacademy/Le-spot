# Brief pédagogique — Écrire J3 & J4 « Ouvrir le capot »

> À utiliser dans **Cowork**, avec le dossier du repo **Le Spot** attaché. Ce brief dit *comment écrire les leçons* ; le repo donne *le vrai code à référencer*. À lire en entier avant d'écrire.

---

## 0. Comment utiliser ce brief (Cowork)

1. **Attache le dossier du repo Le Spot** (celui déjà créé en local).
2. **Lis d'abord le vrai code** avant d'écrire quoi que ce soit. Chaque « va voir dans ton app » doit pointer un **chemin et une fonction réels** du repo — jamais un fichier inventé. Si un nom diffère de ce brief, c'est le repo qui fait foi.
3. **Livre dans Notion** via le connecteur (voir §5). Un module = **une page** dans « Alegria > Cours Vibe coding 2026 » (Notion Perso).
4. Tu peux **modifier le code** du repo si un point pédagogique mérite un exemple plus clair — **mais ne corrige jamais les failles volontaires** (double-booking, RLS, action admin non gardée, validation absente) : elles sont la matière de J5-J6.

---

## 1. Objectif & public

Des étudiants **à l'aise en no-code** (Airtable, Make, WeWeb, Supabase, n8n), qui **connaissent Supabase**, mais qui peuvent **avoir peur du code**. À la fin de J3-J4, ils doivent :

1. **Lire et naviguer** un repo Next.js + Supabase (savoir où vit quoi) ;
2. **Juger** le code produit par une IA (repérer un mauvais choix serveur/client, un secret exposé, un anti-pattern) ;
3. Écrire **un peu** (brancher leur Supabase, ajouter une petite feature).

**Concept-pivot, à marteler partout** : *où tourne le code — serveur ou navigateur*. Tout le reste en découle.

---

## 2. Principes pédagogiques (non négociables)

- **On utilise d'abord, on comprend ensuite.** On manipule, puis on explique.
- **Chaque point se termine par un geste actif** : prédire (avant de regarder), casser, ou modifier. Jamais un simple « va lire le fichier » passif.
- **Calibrer la profondeur** : ils savent déjà Supabase et la logique (Make/n8n). On s'appuie là-dessus, on n'enseigne pas Supabase. Pour le reste, viser « assez pour reconnaître et juger », pas « maîtriser ».
- **Analogies vers leur monde** : une Server Action = « une fonction côté serveur déclenchée par un bouton » (comme un scénario Make).
- **Répétition de la boucle de dev** (cloner → installer → lancer → commit) pour user la peur.

---

## 3. Le standard de qualité

Un rappel théorique, ce n'est **pas une puce**. C'est un court texte qui pose une idée, l'ancre dans Le Spot, et donne une règle à retenir. Voici **l'exemple-or** — vise ce niveau partout :

> **Où tourne votre code ?**
> C'est *la* question à se poser devant chaque fichier d'une app Next.js. Une partie de votre code s'exécute sur le serveur (avant que la page n'arrive dans le navigateur), l'autre dans le navigateur. Ce ne sont pas deux styles d'écriture : ce sont deux mondes avec des règles différentes.
> Sur le **serveur**, le code est au plus près de la base : il interroge Supabase directement, peut lire des secrets, et l'utilisateur ne voit que le résultat. Dans Next.js, c'est là que vit le code **par défaut**.
> Dans le **navigateur**, le code gère ce qui bouge : un clic, un champ, une fenêtre qui s'ouvre. Pour qu'un fichier bascule dans ce monde, il faut l'étiquette `'use client'` en haut — et tout ce qui est marqué part chez l'utilisateur, donc **jamais de secret** dedans.
> Dans Le Spot : la liste des terrains du jour est lue côté serveur ; la fenêtre « Confirmer la réservation » vit côté navigateur. Même app, deux mondes.

À proscrire : les listes de puces qui « résument » sans enseigner, le jargon non expliqué, le « allez voir le fichier » sans tâche, le remplissage.

---

## 4. La boucle de chaque point

1. **Explication courte** (le rappel théorique, niveau §3).
2. **« Va voir dans ton app »** — un fichier réel à ouvrir.
3. **Un geste** : prédire avant de regarder / modifier et observer / repérer.
4. **Callout récap** avec la règle à retenir.

---

## 5. Format Notion (livraison — syntaxe vérifiée)

- **Un module = une page** Notion (sous-page de « Cours Vibe coding 2026 »). Une page par jour : `J3 — …`, `J4 — …`.
- Dans la page : grandes sections en **titre H1 toggle** (`# Titre {toggle="true"}`), sous-sections en **titre H2 toggle** (`## Titre {toggle="true"}`). Contenu enfant indenté d'une tabulation.
- **Callout** : `<callout icon="💡" color="blue_bg">…</callout>` (`💡` point clé, `🔍` indice). **Jamais `<aside>`**.
- **Indices d'exercice** : chacun dans un **toggle bloc** `<details><summary>Indice 1 — …</summary>…</details>`.
- **Code** : blocs triple-backticks avec langage (ts, sql…), uniquement pour du vrai code.
- **Citation** : une ligne `>` avec `<br><br>` entre paragraphes.
- **Pas de divider.** Français, tutoiement « vous ».

---

## 6. J3 — Lire et naviguer

Objectif du jour : savoir **où vit quoi**, et installer le concept-pivot.

### 6.1 Reprise du rituel d'ouverture
Cloner Le Spot, installer les dépendances, lancer le serveur de dev. C'est la répétition de J1 — on insiste sur le fait que c'est la même boucle, pour user la peur. *Geste* : ils lancent l'app et l'ouvrent dans le navigateur.

### 6.2 Brancher SA propre Supabase (exercice manuel)
Ils créent leur projet Supabase, lancent la migration, **vérifient que les tables sont exposées à la Data API** (réglage « expose new tables » / grants — sinon l'app renvoie une erreur claire), renseignent `.env.local`. *Geste* : l'app affiche leurs données. Ça rejoue leur expertise Supabase tout en étant une première fois (brancher une base à une app de code).

### 6.3 La carte du repo : l'arborescence EST le routeur
Théorie : dans l'App Router, un dossier = une URL ; `page.tsx` = la page, `layout.tsx` = l'habillage. *Geste (matching)* : pour chaque écran (`/`, `/mes-reservations`, `/admin`, `/login`), retrouver le fichier qui le produit. Référence les **vrais chemins** du repo.

### 6.4 LE PIVOT : où tourne le code
Rappel théorique au niveau de l'exemple-or (§3). *Geste (prédiction)* : ouvrir deux fichiers réels — un Server Component et un Client Component (`'use client'`) — et **prédire** lequel tourne où et pourquoi, avant l'indice. Callout récap : « serveur par défaut, `'use client'` pour ce qui bouge, jamais de secret côté client ».

### 6.5 Lire un Server Component qui lit Supabase
Sur la vraie vue du jour : montrer comment le composant interroge Supabase **directement** (pas d'API à appeler). *Geste* : trouver la requête, prédire ce qu'elle renvoie, puis modifier un filtre (ex. type/format) et observer.

### 6.6 TypeScript en lecture
Juste assez pour ne pas avoir peur : annotations, unions (`lib/types.ts` du repo), lecture d'une signature. *Geste* : prendre une fonction réelle, dire ce qu'elle **prend** et ce qu'elle **rend**. Pas d'écriture de types complexes.

### 6.7 Tailwind + shadcn
Théorie : Tailwind = des classes utilitaires ; shadcn = des composants **dans le repo** (`components/ui`), qu'on possède et qu'on peut lire. *Geste* : ouvrir un composant `ui/`, changer une classe Tailwind, observer le rendu.

**Récap J3** : callout du concept-pivot + une phrase sur « vous savez maintenant retrouver et lire ».

---

## 7. J4 — Ouvrir, modifier, juger

Objectif du jour : le flux d'écriture, une feature de bout en bout, et **juger l'IA**.

### 7.1 Le flux d'écriture : la Server Action
Théorie : une Server Action est une fonction `'use server'` qui tourne côté serveur et qu'on déclenche depuis l'interface — l'analogie Make/n8n. *Geste* : trouver la Server Action de réservation dans le repo, la lire, prédire ce qui se passe à la soumission du formulaire.

### 7.2 Exercice de bout en bout (les 3 couches)
La pièce maîtresse active : ajouter une petite feature qui traverse **DB → type → UI**. Ex. afficher/filtrer sur un champ, ou ajouter une info sur la carte d'un terrain. Guidé pas à pas, contre le vrai code. C'est là qu'ils sentent qu'ils ont compris le flux complet.

### 7.3 Auth & route protégée
Sur `/mes-reservations` : introduire **légèrement** la session et l'idée de route protégée. Juste assez pour préparer J5 — ne pas approfondir la sécurité ici.

### 7.4 Admin : lire un CRUD complet
Lire le pattern liste → formulaire → suppression sur l'écran admin. *Geste* : retrouver les quatre opérations dans le code.

### 7.5 Juger l'IA (le cœur du J4)
Trois exercices courts, chacun avec une **bonne et une mauvaise version** à comparer (tu peux fabriquer les variantes à partir du vrai code) :

- **Exo A — Serveur ou client ?** Deux versions d'un même composant : l'une lit une clé/un secret dans un composant `'use client'`, l'autre côté serveur. *Geste* : repérer laquelle fuit le secret au navigateur, et expliquer pourquoi.
- **Exo B — Le fetch en `useEffect`.** Un composant qui va chercher les données côté client dans un `useEffect` au lieu de les lire côté serveur. *Geste* : dire pourquoi, ici, c'est un mauvais signe (plus lent, données qui « sautent », logique au mauvais endroit).
- **Exo C — La faille plantée.** Jeter un œil à **une** des faiblesses volontaires du repo (RLS absente / double-booking possible / action admin non revérifiée) **sans la corriger**. *Geste* : nommer le risque. Ça aiguise l'œil et fait le pont vers J5-J6.

**Récap J4 + pont** : callout « vous savez lire, modifier, et flairer ce qui cloche » → « en J5-J6, on répare ».

---

## 8. Garde-fous

- **Écris au niveau §3**, pas en puces. Si une section ressemble à une liste de sujets, ce n'est pas fini.
- **Chaque point a un geste actif.** Pas de lecture passive.
- **Référence le vrai code** (chemins, fonctions réels). Le repo fait foi.
- **Ne corrige pas les failles volontaires.**
- **Ne surcharge pas** : si J3 déborde, décale un point en J4. Le concept-pivot a priorité sur tout le reste.
- **Calibre** : on s'appuie sur leur Supabase et leur logique ; on ne réexplique pas ce qu'ils savent.
