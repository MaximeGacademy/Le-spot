"use client";

// =============================================================================
// src/components/filters.tsx — Filtres type et format
// =============================================================================
//
// "use client" : ce composant a besoin de tourner dans le NAVIGATEUR car il
// écoute les événements onChange des <select> — c'est de l'interactivité.
//
// Mais au lieu de stocker les filtres dans l'état React (useState), on les
// écrit directement dans l'URL via router.push(). Résultat :
//   - L'URL reflète toujours l'état des filtres (partage de lien possible).
//   - Le serveur relit les search params et re-render le planning filtré.
//   - Pas besoin de fetch côté client ni de gestion d'état complexe.
//
// C'est l'îlot client minimal : un onChange → une URL → le serveur fait le reste.

import { useRouter } from "next/navigation";
// useRouter : hook Next.js qui donne accès au routeur côté client.
// router.push() navigue vers une nouvelle URL sans recharger toute la page.

export function Filters({
  date,
  type,
  format,
}: {
  date: string;
  type?: string;
  format?: string;
}) {
  const router = useRouter();

  // update — appelée quand l'utilisateur change un select.
  // Elle reconstruit l'URL complète avec le nouveau filtre et navigue.
  function update(key: "type" | "format", value: string) {
    const sp = new URLSearchParams();
    sp.set("date", date); // on conserve la date courante

    // On gère les deux filtres indépendamment :
    // si on change "type", on conserve "format" et inversement.
    if (key === "type") {
      if (value) sp.set("type", value);   // "" = "tous" → on n'ajoute pas le filtre
      if (format) sp.set("format", format);
    } else {
      if (type) sp.set("type", type);
      if (value) sp.set("format", value);
    }

    // router.push() déclenche une navigation côté client.
    // Next.js détecte que seuls les search params ont changé → il ne recharge
    // pas toute la page, il re-execute seulement le Server Component de la page.
    router.push(`/?${sp.toString()}`);
  }

  const selectClass =
    "h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex items-center gap-2">
      {/* value={type ?? ""} : valeur contrôlée par React.
          Si type est undefined (pas de filtre), on affiche "" (option "Tous les types"). */}
      <select
        aria-label="Filtrer par type"
        className={selectClass}
        value={type ?? ""}
        onChange={(e) => update("type", e.target.value)}
        // e.target.value = la valeur de l'option sélectionnée ("indoor", "outdoor" ou "")
      >
        <option value="">Tous les types</option>
        <option value="indoor">Intérieur</option>
        <option value="outdoor">Extérieur</option>
      </select>

      <select
        aria-label="Filtrer par format"
        className={selectClass}
        value={format ?? ""}
        onChange={(e) => update("format", e.target.value)}
      >
        <option value="">Tous les formats</option>
        <option value="simple">Simple</option>
        <option value="double">Double</option>
      </select>
    </div>
  );
}
