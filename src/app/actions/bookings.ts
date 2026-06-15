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
import { requireUser } from "@/lib/auth-guards";
import { bookingSchema } from "@/lib/schemas";

// BookingResult — ce que renvoie createBooking.
// ok: true  = réservation créée
// ok: false + error: "..." = problème
export type BookingResult = { ok: boolean; error: string | null };

// createBooking — crée une réservation pour l'utilisateur connecté.
// Valide les données via bookingSchema (date non passée, heure entre 9h et 21h)
// avant tout accès à la base.
export async function createBooking(
  _prevState: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const user = await requireUser();

  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Données de réservation invalides." };
  }

  const { court_id, date, start_hour } = parsed.data;

  const supabase = await createClient();

  // INSERT dans Supabase — user_id vient de la session, pas du formulaire.
  const { error } = await supabase.from("bookings").insert({
    court_id,
    user_id: user.id,
    date,
    start_hour,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce créneau vient d'être réservé." };
    }
    return { ok: false, error: error.message };
  }

  // On invalide le cache des pages concernées pour forcer un rechargement
  // des données (le nouveau créneau apparaît comme "pris" immédiatement).
  revalidatePath("/");
  revalidatePath("/mes-reservations");
  return { ok: true, error: null };
}

// cancelBooking — annule une réservation (passe son status à "annulee").
// Le double .eq() garantit qu'un utilisateur ne peut annuler que ses propres réservations.
export async function cancelBooking(formData: FormData): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const id = Number(formData.get("id"));

  // UPDATE — on change le status au lieu de supprimer la ligne.
  // .eq("user_id", user.id) garantit qu'on ne peut annuler que ses propres réservations.
  await supabase
    .from("bookings")
    .update({ status: "annulee" })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath("/mes-reservations");
}
