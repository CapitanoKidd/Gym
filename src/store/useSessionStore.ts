import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveWorkout, SessionLogEntry, WorkoutPlan } from "@/types";
import { buildExerciseGroups, computeNextPointer } from "@/utils/supersets";

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
   * Registra il peso e completa la serie corrente, avanzando allo stato successivo
   * (prossimo esercizio della superserie, riposo, o gruppo/esercizio successivo).
   * Restituisce false se questa era l'ultima serie dell'intero allenamento.
   */
  completeCurrentSet: (plan: WorkoutPlan, weight: number | undefined) => boolean;
  /** Termina subito il riposo corrente e passa alla fase successiva. */
  skipRest: () => void;
  /** Modifica il peso di una serie già registrata (o non ancora eseguita) senza cambiare fase. */
  setSetWeight: (planExerciseId: string, round: number, weight: number | undefined) => void;
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
          },
        }),

      endWorkout: () => set({ active: null }),

      completeCurrentSet: (plan, weight) => {
        const current = get().active;
        if (!current) return false;
        const groups = buildExerciseGroups(plan.exercises);
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
          setLogs[current.round] = { weight, completed: true };
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

      setSetWeight: (planExerciseId, round, weight) =>
        set((s) => {
          if (!s.active) return s;
          const prevLog = s.active.logs[planExerciseId] ?? { setLogs: [] };
          const setLogs = [...prevLog.setLogs];
          const prevSet = setLogs[round] ?? { completed: false };
          setLogs[round] = { ...prevSet, weight };
          return { active: { ...s.active, logs: { ...s.active.logs, [planExerciseId]: { ...prevLog, setLogs } } } };
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
