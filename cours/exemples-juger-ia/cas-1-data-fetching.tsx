// =====================================================================
//  CAS 1 — Charger les données : serveur ou client ?
// =====================================================================

// ❌ MAUVAIS — ce qu'une IA pond souvent : un Client Component qui va
//    chercher les données APRÈS l'affichage, avec useEffect + fetch.
//    Symptômes : un "Chargement…" qui clignote, une requête en plus depuis
//    le navigateur, et la logique de données mélangée à l'UI.
"use client";

import { useEffect, useState } from "react";

export function ListeTerrainsMauvais() {
  const [courts, setCourts] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cette requête part DU NAVIGATEUR, après le premier rendu.
    fetch("/api/courts")
      .then((r) => r.json())
      .then((data) => {
        setCourts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement…</p>;
  return (
    <ul>
      {courts.map((c) => (
        <li key={c.id}>{c.name}</li>
      ))}
    </ul>
  );
}

// ✅ BON — un Server Component : les données sont lues SUR LE SERVEUR,
//    avant l'envoi du HTML. Pas de "Chargement…", pas de route API à
//    maintenir, pas de useEffect. C'est ce que fait `src/app/page.tsx`.
import { createClient } from "@/lib/supabase/server";

export async function ListeTerrainsBon() {
  const supabase = await createClient();
  const { data: courts } = await supabase.from("courts").select("id, name");

  return (
    <ul>
      {(courts ?? []).map((c) => (
        <li key={c.id}>{c.name}</li>
      ))}
    </ul>
  );
}

// À repérer : le `"use client"` + `useEffect(fetch)` est le drapeau rouge.
// La question à se poser : "ai-je VRAIMENT besoin du navigateur pour lire
// ces données ?" Presque toujours : non.
