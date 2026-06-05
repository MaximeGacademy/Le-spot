// Petits utilitaires de dates, partagés serveur ET client.
// On manipule les dates au format "YYYY-MM-DD" (le même format que la colonne `date`).

export function toISODate(d: Date): string {
  // Format local "YYYY-MM-DD" (sans décalage de fuseau).
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

// Renvoie une date "YYYY-MM-DD" décalée de `delta` jours.
export function shiftISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

// Valide une chaîne "YYYY-MM-DD" ; sinon renvoie aujourd'hui.
export function parseDateParam(value: string | undefined): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return todayISO();
}

// Libellé lisible en français, ex. "jeudi 5 juin 2026".
export function formatLongFR(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
