// =====================================================================
//  CAS 4 — Une Server Action qui fait confiance au client
// =====================================================================

// ❌ MAUVAIS — l'action décide du droit à partir d'un champ envoyé PAR LE
//    CLIENT (un <input hidden name="role">). Or tout ce qui vient du client
//    est falsifiable : il suffit de modifier le HTML ou de POSTer à la main
//    avec role=admin. La garde ne protège rien.
"use server";

import { createClient } from "@/lib/supabase/server";

export async function supprimerTerrainMauvais(formData: FormData) {
  const role = String(formData.get("role")); // ❌ vient du navigateur
  if (role !== "admin") return; // ❌ contrôle inutile (falsifiable)

  const supabase = await createClient();
  await supabase.from("courts").delete().eq("id", Number(formData.get("id")));
}

// ✅ BON — l'action RE-vérifie le rôle CÔTÉ SERVEUR, en lisant la session
//    et la base, sans jamais faire confiance à un champ du formulaire.
export async function supprimerTerrainBon(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté");

  // La source de vérité du rôle = la base, pas le formulaire.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Accès refusé");

  await supabase.from("courts").delete().eq("id", Number(formData.get("id")));
}

// À repérer : une autorisation basée sur une donnée venue du client (champ
// caché, prop, paramètre). Règle : une Server Action est un point d'entrée
// PUBLIC — elle doit TOUJOURS revérifier l'identité et les droits côté serveur.
//
// NB : dans Le Spot, les actions admin (src/app/actions/courts.ts) ne font
// PAS cette vérif — c'est une faille VOLONTAIRE, gardée pour J5-J6.
