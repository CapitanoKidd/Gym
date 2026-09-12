import { PlanExercise } from "@/types";

/**
 * Raggruppa gli esercizi consecutivi di una scheda in base al collegamento
 * `supersetWithNext`: una catena di esercizi collegati forma un unico gruppo
 * (superserie), un esercizio non collegato forma un gruppo da solo.
 */
export function buildExerciseGroups(exercises: PlanExercise[]): PlanExercise[][] {
  const groups: PlanExercise[][] = [];
  let current: PlanExercise[] = [];
  for (const ex of exercises) {
    current.push(ex);
    if (!ex.supersetWithNext) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);
  return groups;
}

export interface SessionPointer {
  groupIndex: number;
  memberIndex: number;
  round: number;
}

export interface NextStep {
  pointer: SessionPointer;
  /** true se prima di questo step va inserito un riposo. */
  rest: boolean;
}

/**
 * Calcola dove si trova l'allenamento dopo aver completato la serie corrente:
 * - se nel gruppo (superserie) c'è un altro esercizio in attesa per questo stesso round,
 *   si passa a lui subito, senza riposo;
 * - altrimenti, se qualche esercizio del gruppo ha ancora round da fare, si riposa e si
 *   riparte dal primo esercizio del gruppo che ha un round successivo disponibile;
 * - altrimenti il gruppo è finito: si riposa e si passa al gruppo successivo (round 0);
 * - se non ci sono altri gruppi, l'allenamento è finito (ritorna null).
 */
export function computeNextPointer(groups: PlanExercise[][], pointer: SessionPointer): NextStep | null {
  const group = groups[pointer.groupIndex];
  if (!group) return null;

  let nextMemberIndex = pointer.memberIndex + 1;
  while (nextMemberIndex < group.length && pointer.round >= group[nextMemberIndex].sets) {
    nextMemberIndex++;
  }
  if (nextMemberIndex < group.length) {
    return { pointer: { groupIndex: pointer.groupIndex, memberIndex: nextMemberIndex, round: pointer.round }, rest: false };
  }

  const nextRound = pointer.round + 1;
  const hasMoreRounds = group.some((m) => nextRound < m.sets);
  if (hasMoreRounds) {
    let firstMemberIndex = group.findIndex((m) => nextRound < m.sets);
    if (firstMemberIndex === -1) firstMemberIndex = 0;
    return { pointer: { groupIndex: pointer.groupIndex, memberIndex: firstMemberIndex, round: nextRound }, rest: true };
  }

  const nextGroupIndex = pointer.groupIndex + 1;
  if (nextGroupIndex >= groups.length) return null;
  return { pointer: { groupIndex: nextGroupIndex, memberIndex: 0, round: 0 }, rest: true };
}

/** true se `round` è l'ultima serie prevista per l'esercizio in `memberIndex`. */
export function isLastSetOfMember(group: PlanExercise[], memberIndex: number, round: number): boolean {
  const member = group[memberIndex];
  return !member || round >= member.sets - 1;
}
