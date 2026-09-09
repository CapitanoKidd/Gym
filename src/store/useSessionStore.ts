import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveWorkout } from "@/types";

interface SessionState {
  active: ActiveWorkout | null;
  startWorkout: (planId: string) => void;
  endWorkout: () => void;
  setPhase: (phase: "exercise" | "rest", index?: number) => void;
  nextExercise: (index: number) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      active: null,
      startWorkout: (planId) =>
        set({
          active: {
            planId,
            startedAt: Date.now(),
            currentIndex: 0,
            phase: "exercise",
            phaseStartedAt: Date.now(),
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
    }),
    {
      name: "gym-active-session",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
