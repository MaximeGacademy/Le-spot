"use client";

// =============================================================================
// src/app/login/page.tsx — Page de connexion / inscription
// =============================================================================
//
// "use client" en haut du fichier : ce composant tourne dans le NAVIGATEUR.
// Pourquoi ? Parce qu'il utilise useState pour basculer entre les modes
// "connexion" et "inscription" — c'est de l'interactivité pure navigateur.
//
// Les <form> appellent des Server Actions (signIn / signUp) :
// la vérification des identifiants et la pose des cookies de session
// se font côté SERVEUR malgré le "use client" du composant.

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

// État initial du formulaire : pas d'erreur.
const initial: AuthState = { error: null };

export default function LoginPage() {
  // useState — état local du composant (vit dans le navigateur).
  // mode bascule entre "signin" et "signup" quand on clique sur le lien en bas.
  // Syntaxe : const [valeur, setValeur] = useState(valeurInitiale)
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // On choisit quelle Server Action utiliser selon le mode courant.
  const action = mode === "signin" ? signIn : signUp;

  // useActionState — hook React qui connecte un formulaire à une Server Action.
  // Il renvoie :
  //   state   : le dernier retour de l'action (ici AuthState)
  //   formAction : la fonction à passer en  action={...}  du <form>
  //   pending : true pendant que l'action tourne sur le serveur
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          {/* L'affichage change selon le mode — opérateur ternaire : condition ? siOui : siNon */}
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
          {/* action={formAction} : quand l'utilisateur soumet ce formulaire,
              React envoie les données à la Server Action et met à jour `state`. */}
          <form action={formAction} className="flex flex-col gap-4">
            {/* Ce champ n'apparaît qu'en mode inscription (&&  = "si ... alors affiche") */}
            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">Nom complet</Label>
                {/* name="full_name" : formData.get("full_name") dans la Server Action */}
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

            {/* state.error : message d'erreur renvoyé par la Server Action.
                Il ne s'affiche que si l'action a renvoyé une erreur (sinon null). */}
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            {/* disabled={pending} : le bouton est grisé pendant l'appel serveur
                pour éviter les double-soumissions. */}
            <Button type="submit" disabled={pending}>
              {pending
                ? "Patiente…"
                : mode === "signin"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </Button>
          </form>

          {/* Lien pour basculer entre les deux modes — pas un <Link> Next.js
              car on ne change pas de page, on change juste l'état local. */}
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
