"use server";

// Server Actions du CRUD terrains (espace admin).
// ⚠️ Version naïve : AUCUNE de ces actions ne revérifie le rôle admin côté
//    serveur. Le lien "Admin" est seulement masqué dans l'UI. N'importe qui
//    connaissant l'action peut donc l'appeler. Voir cours/notes-formateur.md.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCourt(formData: FormData): Promise<void> {
  const supabase = await createClient();

  await supabase.from("courts").insert({
    name: String(formData.get("name")),
    type: String(formData.get("type")),
    format: String(formData.get("format")),
    description: String(formData.get("description") ?? "") || null,
    is_active: formData.get("is_active") === "on",
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateCourt(formData: FormData): Promise<void> {
  const supabase = await createClient();

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
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function deleteCourt(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = Number(formData.get("id"));
  await supabase.from("courts").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
}
