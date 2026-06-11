// =============================================================================
// src/app/admin/page.tsx — Espace admin · CRUD des terrains
// =============================================================================
//
// Server Component : on lit la session + le rôle côté serveur.
// Deux niveaux de contrôle d'accès :
//   1. Non connecté → redirection vers /login
//   2. Connecté mais rôle ≠ "admin" → message "accès réservé" (pas de redirect)
//
// ⚠️ FAILLE INTENTIONNELLE : le lien "Admin" dans la nav est masqué pour les
//    non-admins, mais les Server Actions (createCourt, updateCourt, deleteCourt)
//    ne revérifient PAS le rôle. N'importe qui qui connaît ces actions peut
//    les appeler directement. Cette faille sera corrigée en J5-J6.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCourt, updateCourt, deleteCourt } from "@/app/actions/courts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Court } from "@/lib/types";

// Classes CSS communes pour les <select> natifs (shadcn ne fournit pas de
// composant Select compatible avec les Server Actions, on utilise donc le HTML natif).
const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function AdminPage() {
  const supabase = await createClient();

  // ── Vérification d'accès ─────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // .single() : on attend exactement une ligne (le profil de l'utilisateur).
  // Si aucune ligne n'existe, Supabase renvoie une erreur (non gérée ici).
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Si l'utilisateur n'est pas admin, on affiche un message et on s'arrête.
  // On utilise return dans un Server Component pour court-circuiter le rendu.
  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Accès réservé</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page est réservée aux administrateurs.
        </p>
      </div>
    );
  }

  // ── Chargement des terrains ──────────────────────────────────────────────
  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .order("id"); // on trie par id pour un ordre stable
  const courtList = (courts ?? []) as Court[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Administration · Terrains</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajoute, modifie ou supprime des terrains.
      </p>

      {/* ── Formulaire de création ─────────────────────────────────────── */}
      {/* action={createCourt} : à la soumission, Next.js appelle la Server Action */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ajouter un terrain</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourt} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="new-name">Nom</Label>
              <Input id="new-name" name="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-type">Type</Label>
              {/* defaultValue = valeur initiale (non contrôlée par React) */}
              <select id="new-type" name="type" className={selectClass} defaultValue="indoor">
                <option value="indoor">Intérieur</option>
                <option value="outdoor">Extérieur</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-format">Format</Label>
              <select id="new-format" name="format" className={selectClass} defaultValue="double">
                <option value="simple">Simple</option>
                <option value="double">Double</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="new-description">Description</Label>
              <Input id="new-description" name="description" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Actif
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">Créer le terrain</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Liste des terrains existants avec édition inline ──────────── */}
      <h2 className="mt-10 text-lg font-semibold">Terrains existants</h2>
      <div className="mt-4 flex flex-col gap-4">
        {/* Un formulaire par terrain : chaque form envoie les données de son terrain */}
        {courtList.map((court) => (
          <Card key={court.id}>
            <CardContent>
              {/* Formulaire de mise à jour */}
              <form
                action={updateCourt}
                className="grid items-end gap-4 sm:grid-cols-2"
              >
                {/* Champ caché : l'id du terrain est envoyé au serveur sans être
                    visible dans l'interface. La Server Action lit formData.get("id"). */}
                <input type="hidden" name="id" value={court.id} />

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor={`name-${court.id}`}>Nom</Label>
                  {/* defaultValue pré-remplit le champ avec la valeur actuelle */}
                  <Input id={`name-${court.id}`} name="name" defaultValue={court.name} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`type-${court.id}`}>Type</Label>
                  <select
                    id={`type-${court.id}`}
                    name="type"
                    className={selectClass}
                    defaultValue={court.type}
                  >
                    <option value="indoor">Intérieur</option>
                    <option value="outdoor">Extérieur</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`format-${court.id}`}>Format</Label>
                  <select
                    id={`format-${court.id}`}
                    name="format"
                    className={selectClass}
                    defaultValue={court.format}
                  >
                    <option value="simple">Simple</option>
                    <option value="double">Double</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor={`description-${court.id}`}>Description</Label>
                  {/* ?? "" : si description est null, on affiche une chaîne vide */}
                  <Input
                    id={`description-${court.id}`}
                    name="description"
                    defaultValue={court.description ?? ""}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={court.is_active}
                  />
                  Actif
                </label>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" size="sm">
                    Enregistrer
                  </Button>
                </div>
              </form>

              {/* Formulaire de suppression séparé (bouton rouge) */}
              <form action={deleteCourt} className="mt-3 border-t pt-3">
                <input type="hidden" name="id" value={court.id} />
                <Button type="submit" variant="destructive" size="sm">
                  Supprimer ce terrain
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
