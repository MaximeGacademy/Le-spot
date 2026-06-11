// =============================================================================
// src/app/layout.tsx — Layout racine de l'application
// =============================================================================
//
// En Next.js App Router, layout.tsx est le "cadre" qui englobe toutes les pages.
// Il est rendu UNE SEULE FOIS et persiste pendant la navigation : la barre de
// navigation ne re-render pas quand on change de page, seul {children} change.
//
// C'est un SERVER COMPONENT (pas de "use client") : il tourne côté serveur
// et n'a accès ni aux hooks React ni aux événements navigateur.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { Toaster } from "@/components/ui/sonner";

// next/font/google télécharge la police au moment du build et la sert
// depuis nos propres serveurs (pas de requête Google au runtime → plus rapide
// et respectueux de la vie privée). Les polices sont injectées via des
// variables CSS (--font-geist-sans, --font-geist-mono).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// metadata est un objet exporté que Next.js utilise pour générer les balises
// <title> et <meta description> dans le <head> HTML automatiquement.
export const metadata: Metadata = {
  title: "Le Spot · Réservation de padel",
  description: "Réserve ton terrain de padel en un coup d'œil.",
};

// RootLayout reçoit {children} : c'est la page courante (page.tsx, etc.).
// La prop children est de type React.ReactNode — n'importe quel élément React.
// Readonly<...> signifie que ces props ne peuvent pas être modifiées dans le composant.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // On applique les variables de police et la hauteur minimale sur <html>
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="bg-background text-foreground min-h-full flex flex-col"
        // suppressHydrationWarning : évite un warning React quand le serveur
        // et le navigateur produisent un HTML légèrement différent (ex. extensions
        // de navigateur qui modifient le DOM).
        suppressHydrationWarning
      >
        {/* SiteNav est un Server Component : il lit la session et s'affiche une fois */}
        <SiteNav />

        {/* <main> prend tout l'espace vertical disponible (flex-1) */}
        <main className="flex-1">{children}</main>

        {/* Toaster affiche les notifications "toast" (succès, erreurs).
            richColors = couleurs par type ; position = en haut au centre */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
