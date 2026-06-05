"use client";

// Filtres "type" et "format". Composant CLIENT car il réagit à l'utilisateur
// (onChange). Au lieu de stocker l'état dans React, on l'écrit dans l'URL :
// le serveur relit les search params et re-render le planning filtré.
import { useRouter } from "next/navigation";

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

  function update(key: "type" | "format", value: string) {
    const sp = new URLSearchParams();
    sp.set("date", date);
    if (key === "type") {
      if (value) sp.set("type", value);
      if (format) sp.set("format", format);
    } else {
      if (type) sp.set("type", type);
      if (value) sp.set("format", value);
    }
    router.push(`/?${sp.toString()}`);
  }

  const selectClass =
    "h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Filtrer par type"
        className={selectClass}
        value={type ?? ""}
        onChange={(e) => update("type", e.target.value)}
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
