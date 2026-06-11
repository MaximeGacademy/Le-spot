// =============================================================================
// src/components/site-nav.tsx — Barre de navigation principale
// =============================================================================
//
// Server Component : il lit la session et le rôle côté serveur.
// Cela lui permet d'afficher ou masquer les liens selon l'état de connexion
// sans aucun JavaScript supplémentaire dans le navigateur.
//
// ⚠️ Masquer le lien "Admin" ne PROTÈGE PAS l'accès à la page /admin ni aux
//    Server Actions. C'est seulement de la cosmétique. La vraie protection
//    est dans la page /admin elle-même (vérification de rôle au rendu).

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
// buttonVariants : fonction qui renvoie les classes CSS d'un bouton.
// Pratique pour styliser un <Link> comme un bouton sans utiliser le composant Button.

export async function SiteNav() {
  const supabase = await createClient();

  // On récupère l'utilisateur connecté (ou null si personne n'est connecté).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // On charge le rôle uniquement si quelqu'un est connecté.
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
    // ?. = optional chaining : si profile est null, on renvoie null au lieu de crasher.
    // ?? null : si .role est undefined, on substitue null.
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        {/* Liens gauche */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            🎾 Le Spot
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Planning
          </Link>

          {/* On affiche "Mes réservations" seulement si l'utilisateur est connecté.
              user && (...) : si user est null, React n'affiche rien. */}
          {user && (
            <Link
              href="/mes-reservations"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Mes réservations
            </Link>
          )}

          {/* "Admin" n'apparaît que si le rôle est exactement "admin". */}
          {role === "admin" && (
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Boutons droite : connexion ou déconnexion selon l'état */}
        <div className="flex items-center gap-3">
          {user ? (
            // Connecté → on affiche l'email et un bouton de déconnexion.
            <>
              {/* hidden sm:inline : masqué sur mobile, visible à partir de sm (640px) */}
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              {/* Le formulaire appelle la Server Action signOut au clic */}
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  Se déconnecter
                </Button>
              </form>
            </>
          ) : (
            // Pas connecté → lien vers /login stylisé comme un bouton.
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Se connecter
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
