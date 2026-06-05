"use client";

// Page de connexion / inscription. Les <form> appellent des Server Actions
// (signIn / signUp) : la vérification et la pose des cookies se font CÔTÉ SERVEUR.
import { useState, useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initial: AuthState = { error: null };

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "signin" ? "Se connecter" : "Créer un compte"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Connecte-toi pour réserver un terrain."
              : "Crée un compte pour réserver."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">Nom complet</Label>
                <Input id="full_name" name="full_name" type="text" />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" disabled={pending}>
              {pending
                ? "Patiente…"
                : mode === "signin"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setMode("signup")}
                >
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setMode("signin")}
                >
                  Se connecter
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
