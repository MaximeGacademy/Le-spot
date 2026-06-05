// Détail d'un terrain · route DYNAMIQUE [id], publique.
// Le segment [id] devient un paramètre. En Next.js 16, params est une Promise.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Court } from "@/lib/types";

const TYPE_LABEL = { indoor: "Intérieur", outdoor: "Extérieur" } as const;
const FORMAT_LABEL = { simple: "Simple", double: "Double" } as const;

export default async function CourtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: court } = await supabase
    .from("courts")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!court) {
    notFound();
  }
  const c = court as Court;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-muted-foreground underline">
        ← Retour au planning
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl">{c.name}</CardTitle>
            <Badge variant="secondary">{TYPE_LABEL[c.type]}</Badge>
            <Badge variant="outline">{FORMAT_LABEL[c.format]}</Badge>
            {!c.is_active && <Badge variant="destructive">Inactif</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {c.description ?? "Pas de description."}
          </p>
          <div className="mt-6">
            <Button render={<Link href="/" />}>Voir les créneaux du jour</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
