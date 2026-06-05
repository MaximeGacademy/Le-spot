// Unions écrites à la MAIN, en miroir des contraintes CHECK des tables Postgres.
// (Voir supabase/migrations/0001_init.sql.) On les maintient nous-mêmes :
// si on ajoute une valeur dans la base, il faut l'ajouter ici aussi.

export type CourtType = "indoor" | "outdoor";
export type CourtFormat = "simple" | "double";
export type BookingStatus = "confirmee" | "annulee";

// Les lignes telles qu'elles sortent de Supabase.
export type Court = {
  id: number;
  name: string;
  type: CourtType;
  format: CourtFormat;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Booking = {
  id: number;
  court_id: number;
  user_id: string;
  date: string; // "YYYY-MM-DD"
  start_hour: number; // 9 → 21
  status: BookingStatus;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: "client" | "admin";
  created_at: string;
};

// Le planning : un terrain + ses réservations confirmées du jour.
export type CourtWithBookings = Court & {
  bookings: Pick<Booking, "id" | "start_hour" | "user_id" | "status">[];
};

// Les heures d'ouverture : créneaux d'1 h de 9 h à 21 h (dernier créneau 20 h → 21 h).
export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 21;
export const HOURS: number[] = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, i) => OPENING_HOUR + i,
);
