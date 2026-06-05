import { describe, it, expect } from "vitest";
import { toISODate, shiftISO, parseDateParam, formatLongFR } from "./dates";

// Smoke test minimal (chemin heureux). La suite complète viendra en J5-J6.
describe("dates", () => {
  it("toISODate formate une date en YYYY-MM-DD (local)", () => {
    expect(toISODate(new Date(2026, 5, 5))).toBe("2026-06-05");
  });

  it("shiftISO décale d'un nombre de jours (et gère le passage de mois)", () => {
    expect(shiftISO("2026-06-05", 1)).toBe("2026-06-06");
    expect(shiftISO("2026-06-05", -1)).toBe("2026-06-04");
    expect(shiftISO("2026-06-30", 1)).toBe("2026-07-01");
  });

  it("parseDateParam garde une date valide et rejette le reste", () => {
    expect(parseDateParam("2026-12-31")).toBe("2026-12-31");
    expect(parseDateParam("pas-une-date")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parseDateParam(undefined)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("formatLongFR rend un libellé français", () => {
    expect(formatLongFR("2026-06-05")).toContain("juin");
  });
});
