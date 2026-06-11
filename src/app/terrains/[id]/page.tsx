// =============================================================================
// src/app/terrains/[id]/page.tsx — Détail d'un terrain · ROUTE DYNAMIQUE
// =============================================================================
//
// Le dossier s'appelle [id] (avec les crochets) : c'est la syntaxe Next.js pour
// les routes dynamiques. Le segment variable devient un paramètre de la fonction.
//
// Exemples d'URLs qui correspondent à cette page :
//   /terrains/1  →  params.id = "1"
//   /terrains/42 →  params.id = "42"
//   /terrains/abc → params.id = "abc" (on convertit en number, Supabase ne trouve rien)
//
// C'est un Server Component : il charge le terrain directement depuis Supabase.

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Court } from "@/lib/types";

const TYPE_LABEL = { indoor: "Intérieur", outdoor: "Extérieur" } as const;
const FORMAT_LABEL = { simple: "Simple", double: "Double" } as const;

export default async function CourtDetailPage({
  params,
}: {
  // En Next.js 16, params est une Promise (comme searchParams).
  // Le type { id: string } décrit l'objet qu'on obtient après await.
  params: Promise<{ id: string }>;
}) {
  // On attend params pour accéder à id.
  const { id } = await params;

  const supabase = await createClient();

  // .single() : Supabase attend exactement une ligne.
  // Si aucune ligne ne correspond, data sera null (pas d'erreur levée).
  const { data: court } = await supabase
    .from("courts")
    .select("*")
    .eq("id", Number(id)) // on convertit la chaîne en nombre
    .single();

  // notFound() : si le terrain n'existe pas, Next.js affiche la page 404.
  // Cette fonction ne retourne jamais (elle lève une exception interne).
  if (!court) {
    notFound();
  }

  // On annote le type pour avoir l'autocomplétion TypeScript sur les champs.
  const c = court as Court;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Lien de retour vers le planning */}
      <Link href="/" className="text-sm text-muted-foreground underline">
        ← Retour au planning
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl">{c.name}</CardTitle>
            <Badge variant="secondary">{TYPE_LABEL[c.type]}</Badge>
            <Badge variant="outline">{FORMAT_LABEL[c.format]}</Badge>
            {/* Ce badge n'apparaît que si le terrain est inactif */}
            {!c.is_active && <Badge variant="destructive">Inactif</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {/* ?? : si description est null, on affiche un texte par défaut */}
          <p className="text-sm text-muted-foreground">
            {c.description ?? "Pas de description."}
          </p>
          <div className="mt-6">
            <Link href="/" className={buttonVariants()}>
              Voir les créneaux du jour
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
