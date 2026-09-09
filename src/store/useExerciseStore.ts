import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Exercise, MuscleGroup } from "@/types";
import { SEED_EXERCISES } from "@/data/seedExercises";

interface ExerciseState {
  exercises: Exercise[];
  addExercise: (data: Omit<Exercise, "id" | "isCustom">) => Exercise;
  updateExercise: (id: string, data: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getById: (id: string) => Exercise | undefined;
  /** Sostituisce l'intera libreria esercizi (usato dall'import di un backup) */
  replaceAll: (exercises: Exercise[]) => void;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercises: SEED_EXERCISES,
      addExercise: (data) => {
        const newExercise: Exercise = { ...data, id: uuidv4(), isCustom: true };
        set((state) => ({ exercises: [...state.exercises, newExercise] }));
        return newExercise;
      },
      updateExercise: (id, data) => {
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }));
      },
      deleteExercise: (id) => {
        set((state) => ({ exercises: state.exercises.filter((e) => e.id !== id) }));
      },
      getById: (id) => get().exercises.find((e) => e.id === id),
      replaceAll: (exercises) => set({ exercises }),
    }),
    {
      name: "gym-exercises",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => {
        // Versione 1 -> 2: aggiunge il campo `aliases` agli esercizi custom salvati prima
        // dell'introduzione della ricerca intelligente.
        const state = persistedState as ExerciseState;
        if (state?.exercises) {
          state.exercises = state.exercises.map((e) => ({ ...e, aliases: e.aliases ?? [] }));
        }
        return state;
      },
    }
  )
);

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Petto",
  "Schiena",
  "Gambe",
  "Spalle",
  "Bicipiti",
  "Tricipiti",
  "Addominali",
  "Glutei",
  "Cardio",
  "Full Body",
];
