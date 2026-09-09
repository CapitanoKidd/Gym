import { create } from "zustand";

interface PickedExercise {
  exerciseId: string;
  nonce: number;
}

interface PickerResultState {
  lastPicked: PickedExercise | null;
  pick: (exerciseId: string) => void;
  consume: () => void;
}

/**
 * Canale "effimero" (non persistito su disco) per far tornare l'id dell'esercizio scelto
 * da ExercisePickerScreen a PlanEditorScreen dopo un `navigation.goBack()`.
 *
 * Perché non un `onAdd` nei params di navigazione: React Navigation segnala (a ragione)
 * che una funzione nei params non è serializzabile. Perché non `navigate({..., merge:
 * true})` per tornare alla schermata già in stack: si è rivelato inaffidabile — in alcuni
 * casi impila una nuova istanza di PlanEditor invece di riusare quella esistente, perdendo
 * lo stato locale (es. il nome già digitato). Un plain `navigation.goBack()` invece torna
 * sempre, in modo affidabile, all'istanza esistente; questo store porta con sé il dato.
 */
export const usePickerResultStore = create<PickerResultState>((set) => ({
  lastPicked: null,
  pick: (exerciseId) => set({ lastPicked: { exerciseId, nonce: Date.now() } }),
  consume: () => set({ lastPicked: null }),
}));
