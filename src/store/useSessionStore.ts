import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveWorkout, SessionLogEntry, WorkoutPlan } from "@/types";
import { applyEffectiveSets, buildExerciseGroups, computeNextPointer } from "@/utils/supersets";

/** Se l'app non torna in primo piano su una sessione attiva per più di questo tempo, la
 * sessione si considera abbandonata e va scartata invece che ripresa. */
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export function isSessionExpired(active: ActiveWorkout | null): boolean {
  if (!active) return false;
  return Date.now() - active.lastSeenAt > SESSION_TIMEOUT_MS;
}

function makeInitialLogs(plan: WorkoutPlan): Record<string, SessionLogEntry> {
  const logs: Record<string, SessionLogEntry> = {};
  for (const pe of plan.exercises) {
    logs[pe.id] = { setLogs: Array.from({ length: Math.max(1, pe.sets) }, () => ({ completed: false })) };
  }
  return logs;
}

interface SessionState {
  active: ActiveWorkout | null;
  startWorkout: (plan: WorkoutPlan) => void;
  endWorkout: () => void;
  /**
   * Registra peso e ripetizioni e completa la serie corrente, avanzando allo stato
   * successivo (prossimo esercizio della superserie, riposo, o gruppo/esercizio
   * successivo). Restituisce false se questa era l'ultima serie dell'intero allenamento.
   */
  completeCurrentSet: (plan: WorkoutPlan, weight: number | undefined, reps?: number) => boolean;
  /** Termina subito il riposo corrente e passa alla fase successiva. */
  skipRest: () => void;
  /** Allunga/accorcia il riposo in corso di questo tanti secondi (es. -30/+30), senza mai
   * scendere sotto zero. */
  adjustRest: (deltaSeconds: number) => void;
  /** Segna "adesso" come ultimo istante in cui l'app era aperta su questa sessione
   * (va chiamata quando l'app va in background e quando torna in primo piano, per far
   * scadere correttamente le sessioni abbandonate). */
  touchSession: () => void;
  /** Modifica il peso di una serie già registrata (o non ancora eseguita) senza cambiare fase. */
  setSetWeight: (planExerciseId: string, round: number, weight: number | undefined) => void;
  /** Modifica le ripetizioni eseguite di una serie già registrata (o non ancora eseguita). */
  setSetReps: (planExerciseId: string, round: number, reps: number | undefined) => void;
  /** Aggiunge (delta positivo) o toglie (delta negativo) una serie a un esercizio, solo per
   * questa sessione — non tocca la scheda salvata. `baseSets` è il numero di serie previsto
   * dalla scheda, usato come riferimento per calcolare il nuovo totale. Non permette mai di
   * scendere sotto le serie già completate, né sotto 1. */
  adjustSessionSets: (planExerciseId: string, baseSets: number, delta: number) => void;
  setNote: (planExerciseId: string, note: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      active: null,

      startWorkout: (plan) =>
        set({
          active: {
            planId: plan.id,
            startedAt: Date.now(),
            phase: "exercise",
            phaseStartedAt: Date.now(),
            groupIndex: 0,
            memberIndex: 0,
            round: 0,
            restTargetSeconds: 0,
            logs: makeInitialLogs(plan),
            lastSeenAt: Date.now(),
          },
        }),

      endWorkout: () => set({ active: null }),

      completeCurrentSet: (plan, weight, reps) => {
        const current = get().active;
        if (!current) return false;
        // Usa il numero di serie "effettivo" di sessione (piano +/- serie aggiunte/tolte al
        // volo), non quello salvato nella scheda, per sapere quando un esercizio è davvero finito.
        const groups = buildExerciseGroups(applyEffectiveSets(plan.exercises, current.logs));
        const group = groups[current.groupIndex];
        const member = group?.[current.memberIndex];
        if (!member) return false;

        const next = computeNextPointer(groups, {
          groupIndex: current.groupIndex,
          memberIndex: current.memberIndex,
          round: current.round,
        });

        set((s) => {
          if (!s.active) return s;
          const prevLog = s.active.logs[member.id] ?? { setLogs: [] };
          const setLogs = [...prevLog.setLogs];
          setLogs[current.round] = { weight, reps, completed: true };
          const withLog = { ...s.active, logs: { ...s.active.logs, [member.id]: { ...prevLog, setLogs } } };
          if (!next) return { active: withLog };
          return {
            active: {
              ...withLog,
              groupIndex: next.pointer.groupIndex,
              memberIndex: next.pointer.memberIndex,
              round: next.pointer.round,
              phase: next.rest ? "rest" : "exercise",
              phaseStartedAt: Date.now(),
              // Il riposo (quando previsto) è sempre quello dell'esercizio appena completato,
              // sia che si tratti di un esercizio singolo sia dell'ultimo di una superserie.
              restTargetSeconds: next.rest ? member.restSeconds : s.active.restTargetSeconds,
            },
          };
        });

        return next != null;
      },

      skipRest: () =>
        set((s) => (s.active ? { active: { ...s.active, phase: "exercise", phaseStartedAt: Date.now() } } : s)),

      adjustRest: (deltaSeconds) =>
        set((s) =>
          s.active
            ? { active: { ...s.active, restTargetSeconds: Math.max(0, s.active.restTargetSeconds + deltaSeconds) } }
            : s
        ),

      touchSession: () =>
        set((s) => (s.active ? { active: { ...s.active, lastSeenAt: Date.now() } } : s)),

      setSetWeight: (planExerciseId, round, weight) =>
        set((s) => {
          if (!s.active) return s;
          const prevLog = s.active.logs[planExerciseId] ?? { setLogs: [] };
          const setLogs = [...prevLog.setLogs];
          const prevSet = setLogs[round] ?? { completed: false };
          setLogs[round] = { ...prevSet, weight };
          return { active: { ...s.active, logs: { ...s.active.logs, [planExerciseId]: { ...prevLog, setLogs } } } };
        }),

      setSetReps: (planExerciseId, round, reps) =>
        set((s) => {
          if (!s.active) return s;
          const prevLog = s.active.logs[planExerciseId] ?? { setLogs: [] };
          const setLogs = [...prevLog.setLogs];
          const prevSet = setLogs[round] ?? { completed: false };
          setLogs[round] = { ...prevSet, reps };
          return { active: { ...s.active, logs: { ...s.active.logs, [planExerciseId]: { ...prevLog, setLogs } } } };
        }),

      adjustSessionSets: (planExerciseId, baseSets, delta) =>
        set((s) => {
          if (!s.active) return s;
          const prevLog = s.active.logs[planExerciseId] ?? { setLogs: [] };
          const completedCount = prevLog.setLogs.filter((l) => l.completed).length;
          const currentEffective = Math.max(1, baseSets + (prevLog.extraSets ?? 0));
          const newEffective = Math.max(1, completedCount, currentEffective + delta);
          const setLogs = prevLog.setLogs.slice(0, newEffective);
          while (setLogs.length < newEffective) setLogs.push({ completed: false });
          return {
            active: {
              ...s.active,
              logs: {
                ...s.active.logs,
                [planExerciseId]: { ...prevLog, extraSets: newEffective - baseSets, setLogs },
              },
            },
          };
        }),

      setNote: (planExerciseId, note) =>
        set((s) =>
          s.active
            ? {
                active: {
                  ...s.active,
                  logs: {
                    ...s.active.logs,
                    [planExerciseId]: { ...(s.active.logs[planExerciseId] ?? { setLogs: [] }), note },
                  },
                },
              }
            : s
        ),
    }),
    {
      name: "gym-active-session",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
