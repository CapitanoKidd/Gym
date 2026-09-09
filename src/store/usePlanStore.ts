import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { PlanExercise, WorkoutPlan } from "@/types";

export const DEFAULT_REST_SECONDS = 60;
export const DEFAULT_SETS = 3;
export const DEFAULT_REPS = "10-12";

export function makeDraftPlanExercise(exerciseId: string): PlanExercise {
  return {
    id: uuidv4(),
    exerciseId,
    restSeconds: DEFAULT_REST_SECONDS,
    sets: DEFAULT_SETS,
    reps: DEFAULT_REPS,
  };
}

interface PlanState {
  plans: WorkoutPlan[];
  /** Crea la scheda in store e ne restituisce l'id. Usato al momento del "Salva scheda". */
  createPlan: (name: string, exercises: PlanExercise[]) => WorkoutPlan;
  updatePlan: (id: string, name: string, exercises: PlanExercise[]) => void;
  deletePlan: (id: string) => void;
  getById: (id: string) => WorkoutPlan | undefined;
  /** Sostituisce l'intera lista schede (usato dall'import di un backup) */
  replaceAll: (plans: WorkoutPlan[]) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      createPlan: (name, exercises) => {
        const plan: WorkoutPlan = { id: uuidv4(), name, exercises, createdAt: Date.now() };
        set((state) => ({ plans: [...state.plans, plan] }));
        return plan;
      },
      updatePlan: (id, name, exercises) => {
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, name, exercises } : p)),
        }));
      },
      deletePlan: (id) => set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
      getById: (id) => get().plans.find((p) => p.id === id),
      replaceAll: (plans) => set({ plans }),
    }),
    {
      name: "gym-plans",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
