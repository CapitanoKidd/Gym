import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WorkoutHistoryEntry } from "@/types";

interface HistoryState {
  entries: WorkoutHistoryEntry[];
  addEntry: (entry: WorkoutHistoryEntry) => void;
  deleteEntry: (id: string) => void;
  /** Sostituisce l'intero storico (usato dall'import di un backup) */
  replaceAll: (entries: WorkoutHistoryEntry[]) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
      deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      replaceAll: (entries) => set({ entries }),
    }),
    {
      name: "gym-history",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
