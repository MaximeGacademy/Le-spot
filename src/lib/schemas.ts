import { z } from "zod";

export const bookingSchema = z.object({
  // court_id doit être un entier strictement positif
  court_id: z.coerce.number().int().positive(),

  // date au format YYYY-MM-DD et non dans le passé (aujourd'hui accepté)
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD requis")
    .refine(
      (d) => d >= new Date().toISOString().slice(0, 10),
      "La date ne peut pas être dans le passé",
    ),

  // start_hour : créneau entre 9h et 21h inclus
  start_hour: z.coerce.number().int().min(9).max(21),
});

export type BookingInput = z.infer<typeof bookingSchema>;
