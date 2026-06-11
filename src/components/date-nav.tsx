// =============================================================================
// src/components/date-nav.tsx — Navigation par jour (← · aujourd'hui · →)
// =============================================================================
//
// Server Component : ce sont de simples liens <Link> qui n'ont pas besoin
// d'interactivité JavaScript dans le navigateur.
//
// Principe : chaque flèche est un lien vers la même page (/) avec un search
// param "date" différent. Le clic entraîne une navigation → Next.js re-exécute
// la page côté serveur avec la nouvelle date → nouveau HTML.
//
// L'état (la date affichée) vit dans L'URL, pas dans React.
// C'est la frontière nette entre Server et Client : pas de useState ici.

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { shiftISO, todayISO, formatLongFR } from "@/lib/dates";
import type { CourtType, CourtFormat } from "@/lib/types";

// buildHref — construit l'URL avec les search params.
// On reconstruit toujours l'URL complète pour ne pas perdre les filtres actifs
// quand on navigue d'un jour à l'autre.
//
// URLSearchParams est une API native du navigateur ET de Node.js pour
// manipuler les paramètres d'URL sans les concaténer manuellement.
function buildHref(date: string, type?: CourtType, format?: CourtFormat): string {
  const sp = new URLSearchParams();
  sp.set("date", date);
  if (type) sp.set("type", type);     // on n'ajoute le filtre que s'il est défini
  if (format) sp.set("format", format);
  return `/?${sp.toString()}`; // ex. "/?date=2026-06-11&type=indoor"
}

// Props du composant — TypeScript nous force à documenter ce que reçoit DateNav.
// Les ? signifient que type et format sont optionnels.
export function DateNav({
  date,
  type,
  format,
}: {
  date: string;
  type?: CourtType;
  format?: CourtFormat;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Flèche gauche : hier */}
      <Link
        href={buildHref(shiftISO(date, -1), type, format)}
        aria-label="Jour précédent"
        // buttonVariants() applique les styles d'un bouton à un <Link>
        className={buttonVariants({ variant: "outline", size: "icon" })}
      >
        ←
      </Link>

      {/* Bandeau central : affiche la date en toutes lettres */}
      <div className="min-w-[14rem] text-center">
        {/* capitalize : met la première lettre en majuscule (le nom du jour) */}
        <div className="font-medium capitalize">{formatLongFR(date)}</div>
        {/* Ce lien "Revenir à aujourd'hui" n'apparaît que si on n'est pas déjà aujourd'hui */}
        {date !== todayISO() && (
          <Link
            href={buildHref(todayISO(), type, format)}
            className="text-xs text-muted-foreground underline"
          >
            Revenir à aujourd&apos;hui
          </Link>
        )}
      </div>

      {/* Flèche droite : demain */}
      <Link
        href={buildHref(shiftISO(date, 1), type, format)}
        aria-label="Jour suivant"
        className={buttonVariants({ variant: "outline", size: "icon" })}
      >
        →
      </Link>
    </div>
  );
}
