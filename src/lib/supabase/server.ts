// =============================================================================
// src/lib/supabase/server.ts — Client Supabase pour le SERVEUR
// =============================================================================
//
// Ce fichier est utilisé dans les Server Components, Server Actions et
// Route Handlers — partout où le code tourne sur le serveur Node.js.
//
// Différence clé avec le client navigateur :
// - Le client serveur lit et écrit les COOKIES de la requête HTTP en cours.
// - C'est ainsi que Supabase sait quel utilisateur est connecté côté serveur.
// - On doit le recréer à CHAQUE requête (on ne peut pas le partager entre
//   plusieurs utilisateurs — chacun a ses propres cookies de session).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// cookies() est une API Next.js qui donne accès aux cookies de la requête
// HTTP en cours. Elle n'est disponible QUE côté serveur.

export async function createClient() {
  // On attend les cookies de la requête en cours.
  // async/await est nécessaire car Next.js 16 rend cette API asynchrone.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // On dit à Supabase comment lire et écrire les cookies dans cette requête.
      cookies: {
        // getAll() — Supabase nous demande tous les cookies existants.
        getAll() {
          return cookieStore.getAll();
        },
        // setAll() — Supabase veut poser ou mettre à jour des cookies
        // (par ex. pour rafraîchir le token de session).
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Si setAll est appelé depuis un Server Component (pas une Action),
            // Next.js interdit d'écrire des cookies → on ignore silencieusement.
            // Le rafraîchissement de session est géré par src/lib/supabase/proxy.ts
            // qui s'exécute AVANT la page, au niveau du proxy Next.js.
          }
        },
      },
    },
  );
}
