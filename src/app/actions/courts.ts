"use server";

// =============================================================================
// src/app/actions/courts.ts — Server Actions CRUD des terrains (espace admin)
// =============================================================================
//
// Ces actions sont appelées par les formulaires de la page /admin.
// Elles effectuent les opérations INSERT, UPDATE et DELETE sur la table courts.
//
// ⚠️ VERSION NAÏVE INTENTIONNELLE :
//   AUCUNE de ces actions ne vérifie le rôle de l'utilisateur côté serveur.
//   Seul le lien "Admin" dans la navigation est masqué pour les non-admins
//   (vérification UI uniquement). Quelqu'un qui connaît l'existence de ces
//   actions peut les appeler directement, sans passer par l'interface.
//   Cette faille sera corrigée en J5-J6 en ajoutant une vérification de rôle
//   au début de chaque action.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// createCourt — ajoute un nouveau terrain
export async function createCourt(formData: FormData): Promise<void> {
  const supabase = await createClient();

  // formData.get() renvoie une chaîne pour les <input> et <select>,
  // "on" pour une <input type="checkbox"> cochée, null si non cochée.
  await supabase.from("courts").insert({
    name: String(formData.get("name")),
    type: String(formData.get("type")),     // "indoor" ou "outdoor"
    format: String(formData.get("format")), // "simple" ou "double"
    // Si description est vide (""), on stocke null plutôt qu'une chaîne vide.
    // || null : une chaîne vide est "falsy" en JS → on substitue null.
    description: String(formData.get("description") ?? "") || null,
    // La checkbox cochée envoie "on" ; non cochée n'envoie rien (→ null).
    is_active: formData.get("is_active") === "on",
  });

  // Après modification, on invalide le cache des pages qui affichent des terrains.
  revalidatePath("/admin");
  revalidatePath("/");
  // On redirige vers /admin pour voir le terrain nouvellement créé dans la liste.
  redirect("/admin");
}

// updateCourt — modifie un terrain existant
export async function updateCourt(formData: FormData): Promise<void> {
  const supabase = await createClient();

  // L'id vient d'un champ caché <input type="hidden" name="id" value={court.id} />
  const id = Number(formData.get("id"));

  await supabase
    .from("courts")
    .update({
      name: String(formData.get("name")),
      type: String(formData.get("type")),
      format: String(formData.get("format")),
      description: String(formData.get("description") ?? "") || null,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id); // WHERE id = ? — on ne modifie que ce terrain

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

// deleteCourt — supprime un terrain
// La suppression est en CASCADE dans la base (voir migration SQL) :
// supprimer un terrain supprime aussi toutes ses réservations associées.
export async function deleteCourt(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = Number(formData.get("id"));
  await supabase.from("courts").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
  // Pas de redirect ici : on reste sur /admin, la liste se met à jour automatiquement
  // grâce à revalidatePath qui force Next.js à recharger les données de la page.
}
