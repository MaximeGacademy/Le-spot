// =============================================================================
// src/lib/supabase/proxy.ts — Rafraîchissement de session à chaque requête
// =============================================================================
//
// Ce fichier est appelé par src/proxy.ts (l'équivalent du middleware Next.js).
// Il s'exécute AVANT chaque page, pour s'assurer que le token de session
// Supabase est toujours valide.
//
// Comment ça marche ?
// Supabase utilise deux tokens :
//   - access_token  : valide ~1 heure, envoyé à chaque requête Supabase
//   - refresh_token : valide longtemps, sert à obtenir un nouveau access_token
// Si l'access_token a expiré, getClaims() en demande silencieusement un nouveau
// grâce au refresh_token et met à jour les cookies.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
// NextRequest / NextResponse : versions "Edge" des objets Request/Response,
// disponibles dans le proxy Next.js (qui tourne dans un environnement léger).

export async function updateSession(request: NextRequest) {
  // On crée une réponse "passe-plat" : on laisse la requête continuer
  // vers la page, mais on pourra modifier ses headers/cookies avant.
  let supabaseResponse = NextResponse.next({ request });

  // On crée un client Supabase spécial qui lit les cookies de la REQUÊTE
  // et écrit les nouveaux cookies dans la RÉPONSE.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll(); // cookies entrants (depuis le navigateur)
        },
        setAll(cookiesToSet) {
          // On écrit d'abord dans la requête (pour les prochains getAll de ce cycle)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Puis on recrée la réponse avec les nouveaux cookies
          supabaseResponse = NextResponse.next({ request });
          // Et on les ajoute dans les headers de la réponse envoyée au navigateur
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Cette ligne déclenche le rafraîchissement du token si nécessaire.
  // ⚠️ Ne rien faire entre createServerClient() et cette ligne : Supabase
  //    a besoin que les cookies soient dans leur état initial pour rafraîchir.
  await supabase.auth.getClaims();

  // On renvoie supabaseResponse (pas NextResponse.next()) pour que les nouveaux
  // cookies soient bien inclus dans la réponse HTTP envoyée au navigateur.
  return supabaseResponse;
}
