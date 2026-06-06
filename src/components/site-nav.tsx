// Barre de navigation. C'est un Server Component : il lit la session côté serveur
// et n'affiche le lien "Admin" que si l'utilisateur a le rôle admin.
// ⚠️ Masquer le lien ne PROTÈGE pas l'action admin (voir notes-formateur.md).
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            🎾 Le Spot
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Planning
          </Link>
          {user && (
            <Link
              href="/mes-reservations"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Mes réservations
            </Link>
          )}
          {role === "admin" && (
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  Se déconnecter
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Se connecter
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
