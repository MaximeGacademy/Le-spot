// =====================================================================
//  CAS 2 — La frontière des secrets
// =====================================================================

// ❌ MAUVAIS — un Client Component qui utilise la clé service_role.
//    Deux fautes : (1) la clé secrète est préfixée NEXT_PUBLIC_ → elle part
//    dans le bundle JS du navigateur ; (2) elle est utilisée côté client.
//    La service_role contourne toute sécurité : la livrer au navigateur,
//    c'est donner les clés du coffre à tout le monde.
"use client";

import { createClient } from "@supabase/supabase-js";

export function SupprimerToutMauvais() {
  // ⚠️ JAMAIS. Cette clé est maintenant lisible dans les DevTools.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY!, // ❌ secret exposé au navigateur
  );

  async function onClick() {
    await admin.from("bookings").delete().neq("id", 0); // pouvoir total, côté client
  }

  return <button onClick={onClick}>Tout supprimer</button>;
}

// ✅ BON — l'opération sensible vit dans une Server Action. La clé secrète
//    (sans préfixe NEXT_PUBLIC_) ne quitte jamais le serveur. Le navigateur
//    ne reçoit qu'un bouton qui DÉCLENCHE l'action.
//    (Dans Le Spot, les écritures passent par src/app/actions/*.ts.)
import { supprimerToutBon } from "@/app/actions/admin-exemple";

export function SupprimerToutBonUI() {
  return (
    <form action={supprimerToutBon}>
      <button type="submit">Tout supprimer</button>
    </form>
  );
}

// fichier app/actions/admin-exemple.ts (côté serveur) :
//   "use server";
//   import { createClient } from "@supabase/supabase-js";
//   export async function supprimerToutBon() {
//     const admin = createClient(
//       process.env.SUPABASE_URL!,            // pas de NEXT_PUBLIC_
//       process.env.SUPABASE_SERVICE_ROLE_KEY! // reste au serveur
//     );
//     // ... + vérifier le rôle ici (voir cas 4)
//   }

// À repérer : toute clé `service_role` / `secret` près d'un `"use client"`,
// ou tout secret préfixé `NEXT_PUBLIC_`. Règle : seul ce qui est PUBLIC
// porte `NEXT_PUBLIC_`.
