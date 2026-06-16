import { describe, it, expect } from "vitest";
import { creneauxSeChevauchent } from "./booking-rules";

describe("creneauxSeChevauchent", () => {
  it("deux créneaux identiques se chevauchent", () => {
    expect(creneauxSeChevauchent(9, 60, 9, 60)).toBe(true);
  });

  it("un créneau de 120 min qui recoupe le suivant (9h-11h vs 10h-11h)", () => {
    expect(creneauxSeChevauchent(9, 120, 10, 60)).toBe(true);
  });

  it("deux créneaux collés ne se chevauchent PAS (9h-10h et 10h-11h)", () => {
    expect(creneauxSeChevauchent(9, 60, 10, 60)).toBe(false);
  });

  it("un créneau qui en englobe un autre (8h-12h vs 9h-10h)", () => {
    expect(creneauxSeChevauchent(8, 240, 9, 60)).toBe(true);
  });

  it("deux créneaux éloignés ne se chevauchent PAS (9h-10h et 14h-15h)", () => {
    expect(creneauxSeChevauchent(9, 60, 14, 60)).toBe(false);
  });
});
