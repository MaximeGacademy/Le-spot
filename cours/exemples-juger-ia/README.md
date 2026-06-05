# Atelier « Juger l'IA » — 4 cas

Chaque fichier contient **deux versions** d'un même bout de code : la version qu'une IA pond souvent par défaut (❌ `MAUVAIS`) et la version qui respecte la frontière serveur/client (✅ `BON`).

En cours : on montre d'abord la version ❌, on demande aux étudiants **« où tourne ce code, et qu'est-ce qui cloche ? »**, on les laisse chercher, puis on révèle la ✅ et l'explication.

| Cas | Fichier | Anti-pattern |
|---|---|---|
| 1 | `cas-1-data-fetching.tsx` | Charger les données en `useEffect`/`fetch` côté client |
| 2 | `cas-2-secret-expose.tsx` | Exposer une clé secrète au navigateur |
| 3 | `cas-3-tout-en-client.tsx` | Mettre toute la page en `'use client'` |
| 4 | `cas-4-action-non-gardee.ts` | Server Action qui fait confiance au client |

> Ces fichiers sont **du matériel de cours**, pas du code de l'app. Ils ne sont pas compilés (dossier `cours/` exclu du typecheck).
