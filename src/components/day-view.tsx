// =============================================================================
// src/components/day-view.tsx — Grille des terrains et créneaux
// =============================================================================
//
// Server Component : il ne fait que de l'affichage à partir des données déjà
// chargées par la page. Pas d'interactivité directe → pas de "use client".
//
// Architecture "îlots client" :
// Ce composant est serveur, mais il contient des îlots clients (SlotButton).
// Concrètement : DayView génère du HTML statique pour les créneaux pris,
// et des composants SlotButton (qui tournent aussi dans le navigateur) pour
// les créneaux libres. Le navigateur "hydrate" uniquement les SlotButton.

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlotButton } from "@/components/slot-button";
import { HOURS, type CourtWithBookings } from "@/lib/types";

// Dictionnaires de libellés — "as const" dit à TypeScript que ces valeurs
// ne changeront jamais. Cela permet une inférence de type plus précise.
const TYPE_LABEL = { indoor: "Intérieur", outdoor: "Extérieur" } as const;
const FORMAT_LABEL = { simple: "Simple", double: "Double" } as const;

// Props du composant : TypeScript vérifie que l'appelant passe bien ces valeurs.
export function DayView({
  courts,
  date,
  isAuthenticated,
}: {
  courts: CourtWithBookings[]; // tableau de terrains avec leurs réservations
  date: string;
  isAuthenticated: boolean;
}) {
  // Cas "aucun terrain" : on affiche un message vide plutôt qu'une liste vide.
  if (courts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Aucun terrain ne correspond à ces filtres.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pour chaque terrain, on crée une Card avec ses créneaux */}
      {courts.map((court) => {
        // On construit un Set des heures déjà réservées pour ce terrain.
        // Set = ensemble sans doublons. La recherche .has() est en O(1) (très rapide).
        // Ex. si 9h et 14h sont réservés : bookedHours = Set {9, 14}
        const bookedHours = new Set(court.bookings.map((b) => b.start_hour));

        return (
          <Card key={court.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  {/* Le nom du terrain est un lien vers sa page de détail */}
                  <Link href={`/terrains/${court.id}`} className="hover:underline">
                    {court.name}
                  </Link>
                </CardTitle>
                {/* TYPE_LABEL[court.type] → ex. "Intérieur" pour "indoor" */}
                <Badge variant="secondary">{TYPE_LABEL[court.type]}</Badge>
                <Badge variant="outline">{FORMAT_LABEL[court.format]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* On itère sur HOURS = [9, 10, 11, ..., 20] pour afficher chaque créneau */}
              <div className="flex flex-wrap gap-2">
                {HOURS.map((hour) => {
                  const isBooked = bookedHours.has(hour); // true ou false

                  if (isBooked) {
                    // Créneau pris : rendu HTML pur côté serveur, pas de JS.
                    return (
                      <div
                        key={hour}
                        className="flex h-12 w-16 flex-col items-center justify-center rounded-md border bg-muted text-muted-foreground"
                        aria-label={`${hour} h — pris`}
                      >
                        <span className="text-sm font-medium">{hour} h</span>
                        <span className="text-[10px] uppercase">Pris</span>
                      </div>
                    );
                  }

                  // Créneau libre : composant client (bouton interactif + modale).
                  // SlotButton reçoit les données nécessaires en props.
                  return (
                    <SlotButton
                      key={hour}
                      courtId={court.id}
                      courtName={court.name}
                      date={date}
                      hour={hour}
                      isAuthenticated={isAuthenticated}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
