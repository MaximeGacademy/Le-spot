// =============================================================================
// src/app/page.tsx — Vue du jour (planning) · PAGE PUBLIQUE
// =============================================================================
//
// ★ FICHIER CLÉ — contient les concepts fondamentaux du module J3-J4.
//
// Ce fichier est un SERVER COMPONENT :
// - Il tourne sur le serveur Node.js, PAS dans le navigateur.
// - Il peut interroger Supabase directement (comme dans Supabase Studio).
// - Il ne peut PAS utiliser useState, useEffect, onClick, etc.
// - Le navigateur ne reçoit que le HTML final, pas ce code JavaScript.
//
// L'ÉTAT de la page (jour affiché, filtres) vit dans les SEARCH PARAMS de l'URL
// (ex. : /?date=2026-06-11&type=indoor). Quand l'utilisateur change de jour ou
// de filtre, l'URL change → Next.js re-exécute ce composant côté serveur →
// le nouveau HTML est envoyé. Pas de useState, pas de fetch côté client.

import { createClient } from "@/lib/supabase/server";
import { parseDateParam } from "@/lib/dates";
import { DateNav } from "@/components/date-nav";
import { Filters } from "@/components/filters";
import { DayView } from "@/components/day-view";
import type { Court, CourtWithBookings, CourtType, CourtFormat } from "@/lib/types";

// TypeScript : on décrit la forme attendue des search params.
// Tous les champs sont optionnels (?) car l'URL peut ne pas les contenir.
type SearchParams = {
  date?: string;
  type?: string;
  format?: string;
};

// La fonction est async car on fait des appels réseau (await supabase...).
// En Next.js, un Server Component PEUT être async — c'est même courant.
export default async function PlanningPage({
  searchParams,
}: {
  // En Next.js 16, searchParams est une Promise : il faut l'attendre avant
  // de lire ses valeurs. C'est un changement par rapport aux versions précédentes.
  searchParams: Promise<SearchParams>;
}) {
  
  // On attend les paramètres de l'URL
  const params = await searchParams;

  // parseDateParam valide et lit le paramètre "date" (voir lib/dates.ts).
  // Si absent ou invalide, on utilise aujourd'hui.
  const date = parseDateParam(params.date);

  // On valide les filtres : si la valeur ne fait pas partie des valeurs connues,
  // on l'ignore (undefined). Cela évite des requêtes SQL avec des valeurs inattendues.
  const type =
    params.type === "indoor" || params.type === "outdoor" ? params.type : undefined;
  const format =
    params.format === "simple" || params.format === "double"
      ? params.format
      : undefined;

  // On crée le client Supabase SERVEUR (lit les cookies de session).
  const supabase = await createClient();

  // On vérifie si l'utilisateur est connecté — sert uniquement à savoir si
  // un clic sur un créneau libre ouvre la modale ou redirige vers /login.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Requête 1 : les terrains actifs ────────────────────────────────────────
  // On construit la requête en plusieurs étapes (on peut chaîner les filtres).
  let courtsQuery = supabase
    .from("courts")
    .select("*")           // toutes les colonnes
    .eq("is_active", true) // WHERE is_active = true
    .order("name", { ascending: false });

  // On applique les filtres seulement s'ils sont présents dans l'URL.
  if (type) courtsQuery = courtsQuery.eq("type", type);
  if (format) courtsQuery = courtsQuery.eq("format", format);

  const { data: courts } = await courtsQuery;
  // "as Court[]" : on dit à TypeScript quelle forme ont ces données.
  // ?? [] signifie "si courts est null, utilise un tableau vide à la place".
  const courtList = (courts ?? []) as Court[];

  // ── Requête 2 : les réservations confirmées du jour ─────────────────────────
  // On ne charge que les réservations des terrains visibles (filtrés),
  // pour ne pas récupérer de données inutiles.
  const courtIds = courtList.map((c) => c.id); // ex. [1, 2, 3]

  const { data: bookings } = courtIds.length
    ? await supabase
        .from("bookings")
        .select("id, court_id, start_hour, user_id, status") // seulement les colonnes utiles
        .eq("date", date)            // WHERE date = '2026-06-11'
        .eq("status", "confirmee")   // AND status = 'confirmee'
        .in("court_id", courtIds)    // AND court_id IN (1, 2, 3)
    : { data: [] }; // si aucun terrain visible → pas besoin de requêter

  // ── Assemblage : on associe chaque terrain à ses réservations du jour ────────
  // .map() transforme chaque terrain en un objet enrichi avec ses réservations.
  // ...court copie tous les champs du terrain (spread operator).
  // .filter() garde seulement les réservations dont le court_id correspond.
  const courtsWithBookings: CourtWithBookings[] = courtList.map((court) => ({
    ...court,
    bookings: (bookings ?? []).filter((b) => b.court_id === court.id),
  }));

  // ── Rendu HTML ────────────────────────────────────────────────────────────────
  // On passe les données aux composants enfants sous forme de props.
  // DateNav et DayView sont des Server Components → pas de JS envoyé au navigateur.
  // Filters et SlotButton (dans DayView) sont des Client Components → ils
  // reçoivent les données en props et gèrent l'interactivité dans le navigateur.
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Planning du jour</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tous les terrains, leurs créneaux d&apos;une heure de 9 h à 21 h.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* DateNav construit des liens ← → qui changent le search param "date" */}
        <DateNav
          date={date}
          type={type as CourtType | undefined}
          format={format as CourtFormat | undefined}
        />
        {/* Filters est "use client" : il écoute les onChange des selects */}
        <Filters date={date} type={type} format={format} />
      </div>

      <div className="mt-6">
        {/* DayView affiche la grille terrains × créneaux */}
        <DayView
          courts={courtsWithBookings}
          date={date}
          isAuthenticated={Boolean(user)} // convertit user (objet|null) en booléen
        />
      </div>
    </div>
  );
}
