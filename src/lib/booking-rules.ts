// Détecte un chevauchement entre deux créneaux (algorithme d'Allen) :
// deux intervalles [début, fin[ se chevauchent si et seulement si
// chaque début est strictement avant la fin de l'autre.
export function creneauxSeChevauchent(
  debutA: number,
  dureeA: number,
  debutB: number,
  dureeB: number,
): boolean {
  const finA = debutA + dureeA / 60;
  const finB = debutB + dureeB / 60;

  const aCommenceAvantFinB = debutA < finB;
  const bCommenceAvantFinA = debutB < finA;

  return aCommenceAvantFinB && bCommenceAvantFinA;
}
