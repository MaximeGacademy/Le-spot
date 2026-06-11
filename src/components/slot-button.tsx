"use client";
console.log("SLOT BUTTON : où est-ce que je m'affiche ?");

// Un créneau LIBRE. C'est un composant CLIENT (interactivité = clic + modale).
// - Visiteur non connecté  → le clic envoie vers /login (la "porte d'auth").
// - Utilisateur connecté    → le clic ouvre une modale qui déclenche la Server Action.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createBooking } from "@/app/actions/bookings";

export function SlotButton({
  courtId,
  courtName,
  date,
  hour,
  isAuthenticated,
}: {
  courtId: number;
  courtName: string;
  date: string;
  hour: number;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Le <form> appelle cette fonction avec les données du formulaire. On y déclenche
  // la Server Action, puis on réagit à son résultat (toast + fermeture).
  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createBooking({ ok: false, error: null }, formData);
      if (result.ok) {
        toast.success("Réservation confirmée !");
        setOpen(false);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  const label = (
    <>
      <span className="text-sm font-medium">{hour} h</span>
      <span className="text-[10px] uppercase">Libre</span>
    </>
  );

  const slotClass =
    "flex h-12 w-16 flex-col items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";

  // Porte d'authentification : pas connecté → on redirige vers /login.
  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className={slotClass}
        aria-label={`${hour} h — libre, se connecter pour réserver`}
      >
        {label}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={slotClass}
        aria-label={`${hour} h — libre, réserver`}
      >
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réserver {courtName}</DialogTitle>
            <DialogDescription>
              Créneau de {hour} h à {hour + 1} h.
            </DialogDescription>
          </DialogHeader>

          <form action={handleSubmit}>
            {/* Les données du créneau partent au serveur en champs cachés. */}
            <input type="hidden" name="court_id" value={courtId} />
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="start_hour" value={hour} />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Réservation…" : "Confirmer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
