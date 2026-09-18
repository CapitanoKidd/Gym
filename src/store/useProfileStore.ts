import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProfileState {
  /** Nome mostrato nel saluto della home, opzionale. */
  name: string;
  /** Quanti allenamenti a settimana ci si è posti come obiettivo (usato nella home). */
  weeklyGoal: number;
  setName: (name: string) => void;
  setWeeklyGoal: (n: number) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "",
      weeklyGoal: 3,
      setName: (name) => set({ name }),
      setWeeklyGoal: (n) => set({ weeklyGoal: Math.max(1, Math.min(14, n)) }),
    }),
    {
      name: "gym-profile",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
