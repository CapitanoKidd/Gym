import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WorkoutHistoryEntry } from "@/types";

export interface WeightPoint {
  date: number;
  weight: number;
}

interface HistoryState {
  entries: WorkoutHistoryEntry[];
  addEntry: (entry: WorkoutHistoryEntry) => void;
  deleteEntry: (id: string) => void;
  /** Sostituisce l'intero storico (usato dall'import di un backup) */
  replaceAll: (entries: WorkoutHistoryEntry[]) => void;
  /** L'ultimo peso registrato per un esercizio, in ordine cronologico inverso (il più recente per primo). */
  getLastWeightForExercise: (exerciseId: string) => number | undefined;
  /** Tutti i pesi registrati per un esercizio nel tempo, in ordine cronologico crescente (per il grafico). */
  getWeightHistoryForExercise: (exerciseId: string) => WeightPoint[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
      deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      replaceAll: (entries) => set({ entries }),
      getLastWeightForExercise: (exerciseId) => {
        // `entries` è già ordinato dal più recente al più vecchio (addEntry mette in testa)
        for (const entry of get().entries) {
          const match = entry.exercises.find((e) => e.exerciseId === exerciseId && e.weight != null);
          if (match) return match.weight;
        }
        return undefined;
      },
      getWeightHistoryForExercise: (exerciseId) => {
        const points: WeightPoint[] = [];
        for (const entry of get().entries) {
          const match = entry.exercises.find((e) => e.exerciseId === exerciseId && e.weight != null);
          if (match && match.weight != null) {
            points.push({ date: entry.startedAt, weight: match.weight });
          }
        }
        return points.sort((a, b) => a.date - b.date);
      },
    }),
    {
      name: "gym-history",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
