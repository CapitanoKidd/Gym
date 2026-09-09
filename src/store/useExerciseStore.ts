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
      version: 3,
      migrate: (persistedState, fromVersion) => {
        const state = persistedState as ExerciseState;
        if (!state?.exercises) return state;

        if (fromVersion < 2) {
          // Versione 1 -> 2: aggiunge il campo `aliases` agli esercizi custom salvati prima
          // dell'introduzione della ricerca intelligente.
          state.exercises = state.exercises.map((e) => ({ ...e, aliases: e.aliases ?? [] }));
        }

        if (fromVersion < 3) {
          // Versione 2 -> 3: le immagini segnaposto casuali (picsum) vengono tolte dagli
          // esercizi predefiniti (isCustom: false) a favore dell'icona per gruppo
          // muscolare — senza toccare eventuali immagini che l'utente ha impostato lui
          // stesso modificando un esercizio predefinito. In più, aggiunge alla libreria
          // già salvata gli esercizi nuovi introdotti in questa versione (senza duplicare
          // o toccare quelli già presenti).
          state.exercises = state.exercises.map((e) =>
            !e.isCustom && e.imageUrl?.includes("picsum.photos") ? { ...e, imageUrl: undefined } : e
          );
          const existingIds = new Set(state.exercises.map((e) => e.id));
          const newSeedExercises = SEED_EXERCISES.filter((e) => !existingIds.has(e.id));
          state.exercises = [...state.exercises, ...newSeedExercises];
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
