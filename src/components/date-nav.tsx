// Navigation par jour (← jour précédent · aujourd'hui · jour suivant →).
// Server Component : ce sont de simples <Link> qui changent le search param `date`
// en conservant les filtres. Le serveur relit l'URL et re-render le planning.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { shiftISO, todayISO, formatLongFR } from "@/lib/dates";
import type { CourtType, CourtFormat } from "@/lib/types";

function buildHref(date: string, type?: CourtType, format?: CourtFormat): string {
  const sp = new URLSearchParams();
  sp.set("date", date);
  if (type) sp.set("type", type);
  if (format) sp.set("format", format);
  return `/?${sp.toString()}`;
}

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
      <Button
        render={<Link href={buildHref(shiftISO(date, -1), type, format)} />}
        variant="outline"
        size="icon"
        aria-label="Jour précédent"
      >
        ←
      </Button>

      <div className="min-w-[14rem] text-center">
        <div className="font-medium capitalize">{formatLongFR(date)}</div>
        {date !== todayISO() && (
          <Link
            href={buildHref(todayISO(), type, format)}
            className="text-xs text-muted-foreground underline"
          >
            Revenir à aujourd&apos;hui
          </Link>
        )}
      </div>

      <Button
        render={<Link href={buildHref(shiftISO(date, 1), type, format)} />}
        variant="outline"
        size="icon"
        aria-label="Jour suivant"
      >
        →
      </Button>
    </div>
  );
}
