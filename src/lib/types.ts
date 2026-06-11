// =============================================================================
// src/lib/types.ts — Les types TypeScript de l'application
// =============================================================================
//
// TypeScript ajoute des "étiquettes" sur les données pour que l'éditeur
// puisse t'avertir quand tu passes la mauvaise valeur à une fonction.
// Ce fichier centralise toutes les formes de données de l'app.
//
// À retenir : ces types ne font RIEN à l'exécution — ils disparaissent quand
// le code est compilé. Leur seul rôle est d'aider l'éditeur à détecter les
// erreurs AVANT que le code tourne.

// -----------------------------------------------------------------------------
// UNIONS — un type qui ne peut prendre qu'une valeur parmi une liste fixe
// -----------------------------------------------------------------------------
// Syntaxe : TypeA | TypeB | TypeC  (le symbole | se lit "ou")
//
// Exemple : CourtType ne peut valoir QUE "indoor" ou "outdoor".
// Si tu écris  type: "exterieur"  TypeScript signale une erreur immédiatement.
//
// ⚠️ Ces unions sont écrites À LA MAIN, en miroir des contraintes CHECK dans
//    la base de données (voir supabase/migrations/0001_init.sql).
//    Si tu ajoutes une valeur dans la base, il faut l'ajouter ici aussi.

export type CourtType = "indoor" | "outdoor";
export type CourtFormat = "simple" | "double";
export type BookingStatus = "confirmee" | "annulee";

// -----------------------------------------------------------------------------
// TYPES D'OBJETS — la forme d'une ligne qui sort de Supabase
// -----------------------------------------------------------------------------
// Syntaxe :  type MonType = { champ: TypeDuChamp; ... }
//
// Le  ?  après un nom de champ signifie "optionnel" (peut être absent).
// Le  | null  signifie "peut être null" (la valeur existe mais vaut null).
// Ici description est nullable : on sait qu'elle existe mais peut être vide.

export type Court = {
  id: number;           // bigint Postgres → number en TypeScript
  name: string;
  type: CourtType;      // restreint aux valeurs de l'union ci-dessus
  format: CourtFormat;
  description: string | null;  // null si aucune description saisie
  is_active: boolean;
  created_at: string;   // Supabase renvoie les dates sous forme de chaîne ISO
};

export type Booking = {
  id: number;
  court_id: number;
  user_id: string;      // uuid Postgres → string en TypeScript
  date: string;         // format "YYYY-MM-DD", ex. "2026-06-11"
  start_hour: number;   // entier de 9 à 21 (inclus)
  status: BookingStatus;
  created_at: string;
};

export type Profile = {
  id: string;           // même uuid que auth.users(id)
  full_name: string | null;
  role: "client" | "admin";  // union inline (sans déclarer un type séparé)
  created_at: string;
};

// -----------------------------------------------------------------------------
// TYPE COMPOSÉ — "un terrain + ses réservations du jour"
// -----------------------------------------------------------------------------
// L'opérateur  &  fusionne deux types : CourtWithBookings possède TOUS les
// champs de Court, plus le champ bookings supplémentaire.
//
// Pick<Booking, "id" | "start_hour" | ...> sélectionne seulement certains
// champs de Booking (on ne charge pas les colonnes inutiles depuis Supabase).

export type CourtWithBookings = Court & {
  bookings: Pick<Booking, "id" | "start_hour" | "user_id" | "status">[];
  // Le [] à la fin signifie "tableau de" — ici un tableau de réservations partielles.
};

// -----------------------------------------------------------------------------
// CONSTANTES — les heures d'ouverture partagées partout dans l'app
// -----------------------------------------------------------------------------
// Array.from({ length: N }, (_, i) => ...)  crée un tableau de N éléments.
// Le premier argument est la "longueur souhaitée", le deuxième une fonction
// qui reçoit l'index i (0, 1, 2...) et renvoie la valeur à mettre à cette position.
// Résultat : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 21;
export const HOURS: number[] = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, i) => OPENING_HOUR + i,
);
