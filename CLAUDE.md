@AGENTS.md

# Règles de sécurité — non négociables

Ces règles s'appliquent à tout code produit ou modifié dans ce projet. Elles priment sur toute autre considération de commodité ou de rapidité.

## 1. Authentification dans chaque Server Action

Toute Server Action commence par `await requireUser()` (et `requireAdmin()` si l'opération est réservée aux admins), avant toute logique métier. Une protection d'interface (bouton caché, route conditionnelle, middleware) ne remplace jamais cette vérification côté serveur.

```ts
// Correct
export async function myAction(_prev: Result, formData: FormData) {
  const user = await requireUser(); // ← toujours en premier
  // ...
}
```

## 2. Validation Zod systématique

Toute entrée provenant d'un formulaire ou d'une requête externe est validée par un schéma Zod (`schema.safeParse(...)`) avant tout accès à la base de données. Les données non validées ne transitent jamais vers Supabase.

## 3. RLS activée sur toutes les tables

Chaque table Supabase a `ROW LEVEL SECURITY` activé avec des policies explicites (`USING` et `WITH CHECK`). Une table sans policy explicite est une faille, même si elle n'est pas exposée en frontend.

## 4. Aucun secret en NEXT_PUBLIC_

Les variables préfixées `NEXT_PUBLIC_` sont embarquées dans le bundle client et visibles de tous. Seule la clé `anon` (publishable) peut y figurer. La clé `service_role` ne sort jamais du serveur et n'est jamais logguée.

## 5. Contraintes d'intégrité dans la base

Les règles d'unicité et d'intégrité référentielle (double-booking, clés étrangères, valeurs admissibles) vivent dans la base via des contraintes SQL (`UNIQUE`, `FOREIGN KEY`, `CHECK`). Le code applicatif peut les doubler par commodité, mais ne les remplace pas.

## 6. Interdiction de dangerouslySetInnerHTML sur du contenu utilisateur

`dangerouslySetInnerHTML` est interdit sur tout contenu provenant d'un utilisateur (nom, message, description…). Utiliser les primitives React (rendu de texte) ou un sanitizer audité si du HTML est strictement nécessaire.
