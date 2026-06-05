// Le planning lui-même. Server Component : il ne fait que de l'affichage à partir
// des données déjà chargées par la page. Chaque créneau LIBRE est un petit îlot
// client (<SlotButton>) ; les créneaux PRIS sont du simple HTML serveur.
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlotButton } from "@/components/slot-button";
import { HOURS, type CourtWithBookings } from "@/lib/types";

const TYPE_LABEL = { indoor: "Intérieur", outdoor: "Extérieur" } as const;
const FORMAT_LABEL = { simple: "Simple", double: "Double" } as const;

export function DayView({
  courts,
  date,
  isAuthenticated,
}: {
  courts: CourtWithBookings[];
  date: string;
  isAuthenticated: boolean;
}) {
  if (courts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Aucun terrain ne correspond à ces filtres.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {courts.map((court) => {
        const bookedHours = new Set(court.bookings.map((b) => b.start_hour));

        return (
          <Card key={court.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  <Link href={`/terrains/${court.id}`} className="hover:underline">
                    {court.name}
                  </Link>
                </CardTitle>
                <Badge variant="secondary">{TYPE_LABEL[court.type]}</Badge>
                <Badge variant="outline">{FORMAT_LABEL[court.format]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {HOURS.map((hour) => {
                  const isBooked = bookedHours.has(hour);
                  if (isBooked) {
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
