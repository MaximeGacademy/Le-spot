import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// requireUser — récupère l'utilisateur connecté depuis la session Supabase.
// Lance une erreur si personne n'est connecté.
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Non authentifié.");
  }

  return user;
}

// requireAdmin — vérifie que l'utilisateur connecté est un administrateur.
// Lance une erreur si le rôle dans la table profiles n'est pas 'admin'.
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("accès réservé aux administrateurs.");
  }

  return user;
}
