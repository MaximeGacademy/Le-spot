import { test, expect } from "@playwright/test";

// Smoke test E2E (chemin heureux) : se connecter → réserver → voir la réservation.
// La suite complète (cas limites, sécurité) viendra en J5-J6.

// Valeurs PUBLIQUES du projet de démo (clé anon, protégée — en théorie — par la RLS).
const SUPABASE_URL = "https://ijwhsgjsmbsbctsuyiag.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqd2hzZ2pzbWJzYmN0c3V5aWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NjczMzUsImV4cCI6MjA5NjI0MzMzNX0.IFv1a5BAY-fnRTjwp0IPb9gPQAJQ0zjFWLrvHELkgf4";

// Date lointaine = tous les créneaux libres → test déterministe.
const TEST_DATE = "2027-03-15";

// Nettoyage : on supprime les réservations de la date de test (idempotence des runs).
test.afterAll(async ({ request }) => {
  await request.delete(
    `${SUPABASE_URL}/rest/v1/bookings?date=eq.${TEST_DATE}`,
    { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } },
  );
});

test("réservation de bout en bout", async ({ page }) => {
  // 1) Connexion (compte client de démo)
  await page.goto("/login");
  await page.fill("#email", "client@lespot.test");
  await page.fill("#password", "motdepasse");
  await page.getByRole("button", { name: "Se connecter" }).click();

  // 2) On arrive sur le planning
  await page.waitForURL("**/");
  await expect(
    page.getByRole("heading", { name: "Planning du jour" }),
  ).toBeVisible();

  // 3) On va sur une date où tout est libre, et on réserve le 1er créneau de 9 h
  await page.goto(`/?date=${TEST_DATE}`);
  await page
    .getByRole("button", { name: /9 h — libre, réserver/ })
    .first()
    .click();

  // 4) La modale s'ouvre → on confirme
  await expect(page.getByRole("heading", { name: /Réserver/ })).toBeVisible();
  await page.getByRole("button", { name: "Confirmer" }).click();

  // 5) Toast de succès
  await expect(page.getByText("Réservation confirmée !")).toBeVisible();

  // 6) La réservation apparaît dans "Mes réservations"
  await page.goto("/mes-reservations");
  await expect(page.getByText("mars 2027")).toBeVisible();
});
