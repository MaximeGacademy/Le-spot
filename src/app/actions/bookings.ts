"use server";

// =============================================================================
// src/app/actions/bookings.ts — Server Actions de réservation
// =============================================================================
//
// "use server" : ces fonctions tournent sur le serveur, déclenchées par des
// <form action={...}> dans les composants (client ou serveur).
//
// C'est le modèle "une fonction côté serveur déclenchée par un bouton" :
// l'analogie directe avec un scénario Make ou un workflow n8n.
// Le navigateur envoie les données du formulaire → le serveur exécute la
// fonction → revalidatePath() force Next.js à rafraîchir les pages concernées.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// BookingResult — ce que renvoie createBooking.
// ok: true  = réservation créée
// ok: false + error: "..." = problème
export type BookingResult = { ok: boolean; error: string | null };

// createBooking — crée une réservation pour l'utilisateur connecté.
//
// ⚠️ VERSION NAÏVE INTENTIONNELLE :
//   1. Aucune vérification de date passée ou d'heure hors-plage.
//   2. Aucune garde anti double-booking : deux réservations sur le même
//      créneau (court_id + date + start_hour) seront acceptées.
// Ces failles seront corrigées en J5-J6.
export async function createBooking(
  _prevState: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const supabase = await createClient();

  // On récupère l'utilisateur connecté depuis la session (cookie).
  // Si personne n'est connecté, user sera null.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // L'action retourne une erreur — le composant l'affichera via toast.
    return { ok: false, error: "Tu dois être connecté pour réserver." };
  }

  // Number() convertit la chaîne du champ caché en nombre entier.
  // formData.get("court_id") renvoie toujours une chaîne (ou null).
  const court_id = Number(formData.get("court_id"));
  const date = String(formData.get("date"));
  const start_hour = Number(formData.get("start_hour"));

  // INSERT dans Supabase — équivalent de l'opération "Créer un enregistrement"
  // dans Airtable ou Make.
  // user_id est rempli côté serveur (pas depuis le formulaire) pour éviter
  // qu'un utilisateur puisse créer une réservation au nom de quelqu'un d'autre.
  const { error } = await supabase.from("bookings").insert({
    court_id,
    user_id: user.id, // on fait confiance à la session, pas au formulaire
    date,
    start_hour,
    // status = "confirmee" par défaut (valeur par défaut dans la base)
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // On invalide le cache des pages concernées pour forcer un rechargement
  // des données (le nouveau créneau apparaît comme "pris" immédiatement).
  revalidatePath("/");
  revalidatePath("/mes-reservations");
  return { ok: true, error: null };
}

// cancelBooking — annule une réservation (passe son status à "annulee").
//
// ⚠️ VERSION NAÏVE INTENTIONNELLE :
//   On ne vérifie PAS que la réservation appartient à l'utilisateur courant.
//   N'importe quel compte connecté peut annuler n'importe quelle réservation
//   en envoyant l'id correct. Faille à corriger en J5-J6.
export async function cancelBooking(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = Number(formData.get("id"));

  // UPDATE — on change le status au lieu de supprimer la ligne.
  // Cela garde un historique des réservations annulées.
  await supabase.from("bookings").update({ status: "annulee" }).eq("id", id);

  revalidatePath("/");
  revalidatePath("/mes-reservations");
}
