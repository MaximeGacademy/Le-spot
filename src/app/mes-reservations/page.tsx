// =============================================================================
// src/app/mes-reservations/page.tsx — Mes réservations · ROUTE PROTÉGÉE
// =============================================================================
//
// Server Component : il lit la session côté serveur avant d'afficher quoi que
// ce soit. Si l'utilisateur n'est pas connecté, il est redirigé vers /login.
//
// "Route protégée" = une page qui nécessite d'être authentifié pour y accéder.
// La protection se fait ici au niveau du composant (pas dans un middleware).

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelBooking } from "@/app/actions/bookings";
import { formatLongFR } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Type local pour les lignes retournées par la requête Supabase.
// On utilise une jointure implicite (courts(name)) pour récupérer le nom du
// terrain sans faire une deuxième requête. Supabase renvoie l'objet joint
// sous forme { name: string } | null (null si le terrain a été supprimé).
type Row = {
  id: number;
  date: string;
  start_hour: number;
  status: string;
  courts: { name: string } | null; // relation many-to-one vers la table courts
};

export default async function MesReservationsPage() {
  const supabase = await createClient();

  // On vérifie la session côté serveur — getUser() est la méthode sûre
  // (elle valide le token auprès de Supabase, pas juste dans le cookie local).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si pas connecté → redirect() lance une redirection HTTP 307 immédiatement.
  // Le code après cette ligne ne s'exécute jamais si user est null.
  if (!user) {
    redirect("/login");
  }

  // On charge UNIQUEMENT les réservations de cet utilisateur (.eq("user_id", user.id)).
  // courts(name) = jointure : Supabase fait un LEFT JOIN sur la table courts
  // et ne ramène que la colonne "name". Syntaxe propre à Supabase.
  const { data } = await supabase
    .from("bookings")
    .select("id, date, start_hour, status, courts(name)")
    .eq("user_id", user.id)      // WHERE user_id = '...'
    .eq("status", "confirmee")   // AND status = 'confirmee'
    .order("date", { ascending: true })
    .order("start_hour", { ascending: true });

  // "as unknown as Row[]" : TypeScript ne peut pas inférer le type de la jointure
  // automatiquement → on l'annote manuellement. Le "as unknown" est un cast
  // intermédiaire nécessaire quand TypeScript refuse le cast direct.
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Mes réservations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tes créneaux confirmés à venir.
      </p>

      {/* Rendu conditionnel : si rows est vide, on affiche un message vide */}
      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Tu n&apos;as aucune réservation. Va sur le planning pour réserver un
          créneau.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {/* .map() : pour chaque réservation, on crée une Card */}
          {rows.map((row) => (
            // key={row.id} : React a besoin d'un identifiant unique sur chaque
            // élément d'une liste pour optimiser le re-render.
            <Card key={row.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  {/* row.courts peut être null si le terrain a été supprimé */}
                  <div className="font-medium">
                    {row.courts?.name ?? "Terrain supprimé"}
                  </div>
                  {/* ?. = optional chaining : accède à .name seulement si courts n'est pas null */}
                  <div className="text-sm text-muted-foreground capitalize">
                    {formatLongFR(row.date)} · {row.start_hour} h–
                    {row.start_hour + 1} h
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Confirmée</Badge>
                  {/* Formulaire d'annulation : action={cancelBooking} appelle la
                      Server Action directement. L'id du créneau part en champ caché. */}
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
