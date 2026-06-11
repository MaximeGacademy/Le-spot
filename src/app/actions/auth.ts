"use server";

// =============================================================================
// src/app/actions/auth.ts — Server Actions d'authentification
// =============================================================================
//
// "use server" en haut du fichier : TOUTES les fonctions exportées de ce fichier
// deviennent des Server Actions — elles tournent sur le serveur, même quand
// elles sont appelées depuis un composant client (le navigateur).
//
// Analogie Make/n8n : une Server Action = un scénario Make déclenché par un
// bouton. Le clic envoi une requête HTTP au serveur → le serveur exécute la
// fonction → le résultat revient au navigateur.
//
// Avantages par rapport à un fetch() classique :
// - Pas besoin de créer une route API manuellement (Next.js le gère).
// - La fonction a accès aux cookies de session (elle tourne côté serveur).
// - TypeScript vérifie les types de bout en bout.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// AuthState — le type de retour partagé par signIn et signUp.
// error: null  = succès
// error: "..."  = message d'erreur à afficher dans le formulaire
export type AuthState = { error: string | null };

// signIn — connexion avec email + mot de passe
//
// Signature particulière : (_prevState, formData)
// - _prevState : l'état précédent, fourni par useActionState() dans le composant.
//   On ne l'utilise pas ici (le _ indique qu'on l'ignore volontairement).
// - formData : les données du <form> HTML (comme un POST classique).
// - Retour : Promise<AuthState> — une promesse qui se résout en AuthState.
export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // formData.get("email") renvoie le contenu du champ <input name="email">.
  // String(...) convertit la valeur en chaîne (elle pourrait être null).
  // ?? "" : si null, on utilise une chaîne vide.
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // On renvoie un état d'erreur → useActionState() le transmet au composant
    // → le composant affiche le message sous le formulaire.
    return { error: "Email ou mot de passe incorrect." };
  }

  // revalidatePath("/", "layout") : on dit à Next.js que les données du layout
  // (et donc la barre de nav qui affiche l'email) sont périmées → re-render.
  revalidatePath("/", "layout");

  // redirect() lance une redirection côté serveur → le navigateur charge la
  // page d'accueil. Cette fonction ne retourne jamais (elle lève une exception
  // spéciale interceptée par Next.js).
  redirect("/");
}

// signUp — création d'un compte
export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // options.data : métadonnées stockées dans auth.users et copiées dans
    // la table profiles via un trigger Supabase (voir migration SQL).
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  // Si la confirmation d'email est activée dans Supabase, data.session est null
  // après l'inscription (l'email n'est pas encore confirmé). On affiche un
  // message explicatif plutôt que de laisser l'utilisateur confus.
  if (!data.session) {
    return {
      error:
        "Compte créé, mais la confirmation d'email est activée sur Supabase. " +
        "Désactive-la (Authentication → Sign In/Providers → Email → « Confirm email ») " +
        "puis connecte-toi.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// signOut — déconnexion
// Cette action n'a pas besoin de lire le FormData (pas de champ de formulaire).
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut(); // supprime les cookies de session
  revalidatePath("/", "layout");
  redirect("/");
}
