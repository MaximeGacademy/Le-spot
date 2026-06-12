"use client";

import { useRouter } from "next/navigation";

export function Filters({
  date,
  type,
  format,
  maxPrice,
}: {
  date: string;
  type?: string;
  format?: string;
  maxPrice?: string;
}) {
  const router = useRouter();

  function update(key: "type" | "format" | "maxPrice", value: string) {
    const sp = new URLSearchParams();
    sp.set("date", date);

    if (type) sp.set("type", type);
    if (format) sp.set("format", format);
    if (maxPrice) sp.set("maxPrice", maxPrice);

    if (value) sp.set(key, value);
    else sp.delete(key);

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

      <select
        aria-label="Filtrer par prix max"
        className={selectClass}
        value={maxPrice ?? ""}
        onChange={(e) => update("maxPrice", e.target.value)}
      >
        <option value="">Tous les prix</option>
        <option value="25">≤ 25 €</option>
        <option value="40">≤ 40 €</option>
      </select>
    </div>
  );
}