// Client Supabase pour le NAVIGATEUR (composants 'use client').
// Utilise la clé anon (publique). createBrowserClient gère un singleton.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
