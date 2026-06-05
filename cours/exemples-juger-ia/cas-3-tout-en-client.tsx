// =====================================================================
//  CAS 3 — Tout en client vs îlots clients
// =====================================================================

// ❌ MAUVAIS — la page ENTIÈRE est passée en `'use client'` juste parce
//    qu'un bouton a besoin d'un onClick. Conséquences : tout le JS de la
//    page part au navigateur, et on ne peut plus lire les données côté
//    serveur (donc on retombe sur le useEffect du cas 1).
"use client";

import { useState } from "react";

export function PagePlanningMauvais({
  courts,
}: {
  courts: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h1>Planning</h1>
      <ul>
        {courts.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
      <button onClick={() => setOpen(true)}>Réserver</button>
      {open && <p>Modale…</p>}
    </div>
  );
}

// ✅ BON — la page reste un Server Component (elle lit les données), et
//    SEUL le morceau interactif est un îlot `'use client'`. C'est le
//    pattern de Le Spot : `day-view.tsx` (serveur) + `slot-button.tsx` (client).

// page.tsx (Server Component, pas de "use client") :
import { createClient } from "@/lib/supabase/server";
import { BoutonReserver } from "./bouton-reserver";

export async function PagePlanningBon() {
  const supabase = await createClient();
  const { data: courts } = await supabase.from("courts").select("id, name");

  return (
    <div>
      <h1>Planning</h1>
      <ul>
        {(courts ?? []).map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
      <BoutonReserver /> {/* petit îlot client */}
    </div>
  );
}

// bouton-reserver.tsx (le SEUL fichier 'use client') :
//   "use client";
//   import { useState } from "react";
//   export function BoutonReserver() {
//     const [open, setOpen] = useState(false);
//     return <button onClick={() => setOpen(true)}>Réserver</button>;
//   }

// À repérer : un `'use client'` tout en haut d'une grosse page.
// La question : "qu'est-ce qui a VRAIMENT besoin d'interactivité ?" — et
// n'isoler que ça.
