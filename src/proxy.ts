// "Proxy" = l'ancien "middleware" (renommé en Next.js 16). Il s'exécute AVANT
// chaque requête correspondant au matcher, et sert ici à rafraîchir la session.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Tout sauf les fichiers statiques et les images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
