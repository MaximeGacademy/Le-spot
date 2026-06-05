"use server";

// Server Actions de réservation. C'est le modèle "une fonction côté serveur
// déclenchée par un bouton" (l'analogie Make/n8n).
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BookingResult = { ok: boolean; error: string | null };

// Crée une réservation pour l'utilisateur connecté.
// ⚠️ Version naïve : aucune validation (date passée, heure hors plage) et
//    aucune garde anti double-booking. Voir cours/notes-formateur.md.
export async function createBooking(
  _prevState: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Tu dois être connecté pour réserver." };
  }

  const court_id = Number(formData.get("court_id"));
  const date = String(formData.get("date"));
  const start_hour = Number(formData.get("start_hour"));

  const { error } = await supabase.from("bookings").insert({
    court_id,
    user_id: user.id,
    date,
    start_hour,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/mes-reservations");
  return { ok: true, error: null };
}

// Annule une réservation par son id.
// ⚠️ Version naïve : on ne vérifie PAS que la réservation appartient bien à
//    l'utilisateur courant. N'importe quel compte connecté peut annuler
//    n'importe quelle réservation. Voir cours/notes-formateur.md.
export async function cancelBooking(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = Number(formData.get("id"));

  await supabase.from("bookings").update({ status: "annulee" }).eq("id", id);

  revalidatePath("/");
  revalidatePath("/mes-reservations");
}
