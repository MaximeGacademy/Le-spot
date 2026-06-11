// =============================================================================
// src/lib/dates.ts — Utilitaires de manipulation de dates
// =============================================================================
//
// Ces fonctions sont utilisées côté SERVEUR et côté CLIENT (elles ne dépendent
// ni de Next.js ni de React).
//
// On manipule les dates sous forme de chaîne "YYYY-MM-DD" — le même format
// que la colonne `date` dans Supabase. Travailler avec des chaînes plutôt
// qu'avec des objets Date évite les problèmes de fuseau horaire.

// -----------------------------------------------------------------------------
// toISODate — convertit un objet Date JavaScript en "YYYY-MM-DD"
// -----------------------------------------------------------------------------
// On reconstruit la chaîne manuellement pour utiliser l'heure LOCALE du
// navigateur/serveur (et non UTC). Sans ça, new Date().toISOString() donnerait
// parfois le jour d'avant pour les fuseaux à l'ouest de UTC.
//
// padStart(2, "0") ajoute un zéro devant si le nombre < 10  (ex. "6" → "06").

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // getMonth() est 0-indexé !
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// todayISO — renvoie la date d'aujourd'hui au format "YYYY-MM-DD".
export function todayISO(): string {
  return toISODate(new Date());
}

// -----------------------------------------------------------------------------
// shiftISO — décale une date de `delta` jours
// -----------------------------------------------------------------------------
// Exemple :  shiftISO("2026-06-11", -1)  →  "2026-06-10"
//            shiftISO("2026-06-11",  1)  →  "2026-06-12"
//
// On destructure la chaîne en [y, m, d] avec .split("-").map(Number),
// puis on laisse l'objet Date gérer les débordements de mois automatiquement
// (ex. : 31 + 1 → 1er du mois suivant).

export function shiftISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d); // m - 1 car les mois sont 0-indexés dans Date
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

// -----------------------------------------------------------------------------
// parseDateParam — valide et lit le search param `date` de l'URL
// -----------------------------------------------------------------------------
// Le search param vient de l'URL (?date=2026-06-11). Il peut être :
//   - absent (undefined) → on renvoie aujourd'hui
//   - malformé ("abcd")  → on renvoie aujourd'hui (sécurité basique)
//   - correct            → on le renvoie tel quel
//
// La regex  /^\d{4}-\d{2}-\d{2}$/  vérifie que la chaîne ressemble à une date
// sans utiliser new Date() (qui accepterait des valeurs invalides).

export function parseDateParam(value: string | undefined): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return todayISO();
}

// -----------------------------------------------------------------------------
// formatLongFR — affichage lisible en français
// -----------------------------------------------------------------------------
// Intl.DateTimeFormat est l'API native du navigateur/Node pour formater les
// dates selon une locale. Pas besoin de librairie externe.
//
// Résultat : "jeudi 11 juin 2026"

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
