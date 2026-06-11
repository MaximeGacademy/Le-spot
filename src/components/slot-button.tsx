"use client";

// =============================================================================
// src/components/slot-button.tsx — Bouton de créneau libre (composant client)
// =============================================================================
//
// ★ FICHIER CLÉ — démontre l'îlot client et le flux complet de réservation.
//
// "use client" : ce composant tourne dans le NAVIGATEUR car il a besoin de :
//   - useState  (ouvrir/fermer la modale)
//   - useRouter (rediriger vers /login)
//   - useTransition (gérer le "pending" pendant l'appel serveur)
//
// Flux complet pour un utilisateur connecté :
//   1. L'utilisateur clique sur un créneau vert → setOpen(true) ouvre la modale
//   2. Il clique "Confirmer" → handleSubmit() est appelée avec les données du form
//   3. startTransition() marque le début d'une opération async non bloquante
//   4. createBooking() (Server Action) est appelée → tourne côté SERVEUR
//   5. La Server Action renvoie { ok, error } → toast + fermeture de la modale

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// toast : affiche une notification en haut de l'écran (via le <Toaster> dans layout.tsx)
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

// Props : les données que ce composant reçoit de son parent (DayView).
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

  // open : true si la modale de confirmation est affichée, false sinon.
  const [open, setOpen] = useState(false);

  // useTransition — marque une mise à jour d'état comme "non urgente".
  // pending = true pendant que la fonction async dans startTransition() tourne.
  // Cela permet de désactiver le bouton pendant l'appel à la Server Action.
  const [pending, startTransition] = useTransition();

  // handleSubmit — déclenché quand l'utilisateur soumet le formulaire de la modale.
  // formData contient les champs cachés (court_id, date, start_hour).
  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      // On appelle la Server Action directement, comme une fonction normale.
      // Sous le capot, Next.js envoie une requête HTTP POST au serveur.
      const result = await createBooking({ ok: false, error: null }, formData);

      if (result.ok) {
        toast.success("Réservation confirmée !");
        setOpen(false); // on ferme la modale
        // Le planning se met à jour automatiquement grâce à revalidatePath()
        // dans la Server Action.
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  // Le contenu visuel du bouton (partagé entre les deux cas ci-dessous)
  const label = (
    <>
      <span className="text-sm font-medium">{hour} h</span>
      <span className="text-[10px] uppercase">Libre</span>
    </>
  );

  // Classes CSS du bouton vert (libre)
  const slotClass =
    "flex h-12 w-16 flex-col items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";

  // ── Cas 1 : visiteur non connecté ─────────────────────────────────────────
  // Le clic redirige vers /login (porte d'authentification).
  // Pas de modale : on envoie d'abord l'utilisateur se connecter.
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

  // ── Cas 2 : utilisateur connecté ──────────────────────────────────────────
  // Le clic ouvre une modale de confirmation.
  return (
    <>
      {/* Bouton qui ouvre la modale */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={slotClass}
        aria-label={`${hour} h — libre, réserver`}
      >
        {label}
      </button>

      {/* Dialog = modale shadcn/ui.
          open et onOpenChange permettent à React de contrôler l'affichage.
          onOpenChange est appelée avec false quand l'utilisateur clique en dehors. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réserver {courtName}</DialogTitle>
            <DialogDescription>
              Créneau de {hour} h à {hour + 1} h.
            </DialogDescription>
          </DialogHeader>

          {/* action={handleSubmit} : on passe notre fonction (pas une Server Action).
              React appelle handleSubmit(formData) à la soumission. */}
          <form action={handleSubmit}>
            {/* Champs cachés : les données du créneau sont envoyées au serveur
                sans être visibles dans l'interface. */}
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
              {/* disabled={pending} : grisé pendant l'appel serveur */}
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
