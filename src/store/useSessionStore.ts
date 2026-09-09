import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveWorkout, SessionLogEntry } from "@/types";

interface SessionState {
  active: ActiveWorkout | null;
  startWorkout: (planId: string) => void;
  endWorkout: () => void;
  setPhase: (phase: "exercise" | "rest", index?: number) => void;
  nextExercise: (index: number) => void;
  setNote: (planExerciseId: string, note: string) => void;
  setWeight: (planExerciseId: string, weight: number | undefined) => void;
  getLog: (planExerciseId: string) => SessionLogEntry | undefined;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      active: null,
      startWorkout: (planId) =>
        set({
          active: {
            planId,
            startedAt: Date.now(),
            currentIndex: 0,
            phase: "exercise",
            phaseStartedAt: Date.now(),
            logs: {},
          },
        }),
      endWorkout: () => set({ active: null }),
      setPhase: (phase, index) =>
        set((state) =>
          state.active
            ? {
                active: {
                  ...state.active,
                  phase,
                  phaseStartedAt: Date.now(),
                  currentIndex: index ?? state.active.currentIndex,
                },
              }
            : state
        ),
      nextExercise: (index) =>
        set((state) =>
          state.active
            ? { active: { ...state.active, currentIndex: index, phase: "exercise", phaseStartedAt: Date.now() } }
            : state
        ),
      setNote: (planExerciseId, note) =>
        set((state) =>
          state.active
            ? {
                active: {
                  ...state.active,
                  logs: { ...state.active.logs, [planExerciseId]: { ...state.active.logs[planExerciseId], note } },
                },
              }
            : state
        ),
      setWeight: (planExerciseId, weight) =>
        set((state) =>
          state.active
            ? {
                active: {
                  ...state.active,
                  logs: { ...state.active.logs, [planExerciseId]: { ...state.active.logs[planExerciseId], weight } },
                },
              }
            : state
        ),
      getLog: (planExerciseId) => get().active?.logs[planExerciseId],
    }),
    {
      name: "gym-active-session",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
