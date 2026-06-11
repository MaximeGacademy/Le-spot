// =============================================================================
// src/lib/utils.ts — Utilitaire de classes CSS (généré par shadcn/ui)
// =============================================================================
//
// Ce fichier est créé automatiquement par shadcn/ui. Tu n'as normalement pas
// à le modifier. Il expose une seule fonction : cn().

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn() — "class names" — combine des classes Tailwind de façon intelligente.
//
// Problème sans cn() : si tu écris  className="p-4 p-2"  Tailwind applique
// les DEUX règles et le résultat est imprévisible.
//
// Avec cn(), twMerge résout les conflits (p-4 vs p-2 → garde le dernier).
// clsx permet de passer des conditions :  cn("p-4", isActive && "bg-blue-500")
//
// Utilisation typique dans un composant :
//   <div className={cn("p-4 rounded", isActive && "bg-blue-500")} />
//
// Le ...inputs (syntaxe "rest") signifie "autant d'arguments qu'on veut".
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
