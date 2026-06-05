// "Mes réservations" · route PROTÉGÉE.
// Server Component : on lit la session côté serveur. Pas connecté → redirection.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelBooking } from "@/app/actions/bookings";
import { formatLongFR } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Row = {
  id: number;
  date: string;
  start_hour: number;
  status: string;
  courts: { name: string } | null;
};

export default async function MesReservationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("bookings")
    .select("id, date, start_hour, status, courts(name)")
    .eq("user_id", user.id)
    .eq("status", "confirmee")
    .order("date", { ascending: true })
    .order("start_hour", { ascending: true });

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Mes réservations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tes créneaux confirmés à venir.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Tu n&apos;as aucune réservation. Va sur le planning pour réserver un
          créneau.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {row.courts?.name ?? "Terrain supprimé"}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {formatLongFR(row.date)} · {row.start_hour} h–
                    {row.start_hour + 1} h
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Confirmée</Badge>
                  <form action={cancelBooking}>
                    <input type="hidden" name="id" value={row.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Annuler
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
