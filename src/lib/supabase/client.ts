// =============================================================================
// src/lib/supabase/client.ts — Client Supabase pour le NAVIGATEUR
// =============================================================================
//
// Ce fichier est utilisé UNIQUEMENT dans les composants "use client".
// Il crée un client Supabase qui tourne dans le navigateur de l'utilisateur.
//
// ┌─────────────────────────────────────────────────────────────┐
// │  SERVEUR (Node.js)          │  NAVIGATEUR (JavaScript)      │
// │  → src/lib/supabase/server  │  → src/lib/supabase/client    │
// └─────────────────────────────────────────────────────────────┘
//
// Pourquoi deux fichiers séparés ?
// - Le client navigateur gère les cookies différemment du client serveur.
// - createBrowserClient() crée un SINGLETON : si tu appelles createClient()
//   plusieurs fois dans le même onglet, tu obtiens toujours le même objet
//   (optimisation de mémoire).

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    // Ces variables d'environnement commencent par NEXT_PUBLIC_ :
    // Next.js les inclut dans le bundle JavaScript envoyé au navigateur.
    // La clé "anon" est publique (tout le monde peut la voir dans le HTML).
    // C'est la RLS (Row Level Security) dans Supabase qui protège les données —
    // pas le fait que la clé soit secrète.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Le ! à la fin signifie "je garantis que ce n'est pas undefined"
    // (TypeScript nous croît sur parole — si la variable est absente, ça crashe)
  );
}
