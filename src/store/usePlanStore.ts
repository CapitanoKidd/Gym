import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { PlanExercise, WorkoutPlan } from "@/types";

export const DEFAULT_REST_SECONDS = 60;

interface PlanState {
  plans: WorkoutPlan[];
  createPlan: (name: string) => WorkoutPlan;
  deletePlan: (id: string) => void;
  renamePlan: (id: string, name: string) => void;
  addExerciseToPlan: (planId: string, exerciseId: string) => void;
  removeExerciseFromPlan: (planId: string, planExerciseId: string) => void;
  reorderPlanExercises: (planId: string, newOrder: PlanExercise[]) => void;
  updateRestSeconds: (planId: string, planExerciseId: string, seconds: number) => void;
  updateSetsReps: (planId: string, planExerciseId: string, sets?: number, reps?: string) => void;
  getById: (id: string) => WorkoutPlan | undefined;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      createPlan: (name) => {
        const plan: WorkoutPlan = { id: uuidv4(), name, exercises: [], createdAt: Date.now() };
        set((state) => ({ plans: [...state.plans, plan] }));
        return plan;
      },
      deletePlan: (id) => set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
      renamePlan: (id, name) =>
        set((state) => ({ plans: state.plans.map((p) => (p.id === id ? { ...p, name } : p)) })),
      addExerciseToPlan: (planId, exerciseId) => {
        const entry: PlanExercise = {
          id: uuidv4(),
          exerciseId,
          restSeconds: DEFAULT_REST_SECONDS,
          sets: 3,
          reps: "10-12",
        };
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId ? { ...p, exercises: [...p.exercises, entry] } : p
          ),
        }));
      },
      removeExerciseFromPlan: (planId, planExerciseId) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? { ...p, exercises: p.exercises.filter((e) => e.id !== planExerciseId) }
              : p
          ),
        }));
      },
      reorderPlanExercises: (planId, newOrder) => {
        set((state) => ({
          plans: state.plans.map((p) => (p.id === planId ? { ...p, exercises: newOrder } : p)),
        }));
      },
      updateRestSeconds: (planId, planExerciseId, seconds) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  exercises: p.exercises.map((e) =>
                    e.id === planExerciseId ? { ...e, restSeconds: Math.max(0, seconds) } : e
                  ),
                }
              : p
          ),
        }));
      },
      updateSetsReps: (planId, planExerciseId, sets, reps) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  exercises: p.exercises.map((e) =>
                    e.id === planExerciseId ? { ...e, sets: sets ?? e.sets, reps: reps ?? e.reps } : e
                  ),
                }
              : p
          ),
        }));
      },
      getById: (id) => get().plans.find((p) => p.id === id),
    }),
    {
      name: "gym-plans",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
