console.log("PLANNING : où est-ce que je m'affiche ?");

// Vue du jour (planning) · PUBLIQUE.
// C'est un Server Component : il interroge Supabase DIRECTEMENT, côté serveur.
// L'état (jour affiché, filtres) vit dans les SEARCH PARAMS de l'URL.
import { createClient } from "@/lib/supabase/server";
import { parseDateParam } from "@/lib/dates";
import { DateNav } from "@/components/date-nav";
import { Filters } from "@/components/filters";
import { DayView } from "@/components/day-view";
import type { Court, CourtWithBookings, CourtType, CourtFormat } from "@/lib/types";

type SearchParams = {
  date?: string;
  type?: string;
  format?: string;
};

export default async function PlanningPage({
  searchParams,
}: {
  // En Next.js 16, searchParams est une Promise : on l'attend.
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const date = parseDateParam(params.date);
  const type =
    params.type === "indoor" || params.type === "outdoor" ? params.type : undefined;
  const format =
    params.format === "simple" || params.format === "double"
      ? params.format
      : undefined;

  const supabase = await createClient();

  // Suis-je connecté ? (sert juste à savoir si un clic ouvre la modale ou la page login)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1) Les terrains actifs, filtrés selon l'URL.
  let courtsQuery = supabase
    .from("courts")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: false });

  if (type) courtsQuery = courtsQuery.eq("type", type);
  if (format) courtsQuery = courtsQuery.eq("format", format);

  const { data: courts } = await courtsQuery;
  const courtList = (courts ?? []) as Court[];

  // 2) Les réservations confirmées de ce jour, pour ces terrains.
  const courtIds = courtList.map((c) => c.id);
  const { data: bookings } = courtIds.length
    ? await supabase
      .from("bookings")
      .select("id, court_id, start_hour, user_id, status")
      .eq("date", date)
      .eq("status", "confirmee")
      .in("court_id", courtIds)
    : { data: [] };

  // 3) On rattache à chaque terrain ses réservations du jour.
  const courtsWithBookings: CourtWithBookings[] = courtList.map((court) => ({
    ...court,
    bookings: (bookings ?? []).filter((b) => b.court_id === court.id),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Planning du jour</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tous les terrains, leurs créneaux d&apos;une heure de 9 h à 21 h.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DateNav
          date={date}
          type={type as CourtType | undefined}
          format={format as CourtFormat | undefined}
        />
        <Filters date={date} type={type} format={format} />
      </div>

      <div className="mt-6">
        <DayView
          courts={courtsWithBookings}
          date={date}
          isAuthenticated={Boolean(user)}
        />
      </div>
    </div>
  );
}
