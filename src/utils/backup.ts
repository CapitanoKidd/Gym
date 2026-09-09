import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { BackupData } from "@/types";
import { useExerciseStore } from "@/store/useExerciseStore";
import { usePlanStore } from "@/store/usePlanStore";
import { useHistoryStore } from "@/store/useHistoryStore";

/** Esporta esercizi, schede e storico in un file JSON e apre il foglio di condivisione. */
export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    exercises: useExerciseStore.getState().exercises,
    plans: usePlanStore.getState().plans,
    history: useHistoryStore.getState().entries,
  };

  const dir = FileSystem.documentDirectory;
  if (!dir) throw new Error("Impossibile accedere alla cartella documenti del dispositivo.");
  const fileName = `la-mia-palestra-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const fileUri = dir + fileName;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType: "application/json", dialogTitle: "Esporta backup" });
  }
}

export type ImportMode = "merge" | "replace";

/**
 * Apre il selettore file, legge un backup JSON e lo importa.
 * "replace" sovrascrive tutto; "merge" aggiunge senza duplicare gli id già presenti.
 * Restituisce false se l'utente ha annullato la selezione del file.
 */
export async function importBackup(mode: ImportMode): Promise<boolean> {
  const picked = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets?.[0]) return false;

  const content = await FileSystem.readAsStringAsync(picked.assets[0].uri);
  const data = JSON.parse(content) as BackupData;

  if (!data || !Array.isArray(data.exercises) || !Array.isArray(data.plans)) {
    throw new Error("Il file selezionato non sembra un backup valido di questa app.");
  }

  if (mode === "replace") {
    useExerciseStore.getState().replaceAll(data.exercises);
    usePlanStore.getState().replaceAll(data.plans);
    useHistoryStore.getState().replaceAll(data.history ?? []);
    return true;
  }

  // merge: unisce evitando duplicati per id
  const currentExercises = useExerciseStore.getState().exercises;
  const mergedExercises = [
    ...currentExercises,
    ...data.exercises.filter((e) => !currentExercises.some((c) => c.id === e.id)),
  ];
  useExerciseStore.getState().replaceAll(mergedExercises);

  const currentPlans = usePlanStore.getState().plans;
  const mergedPlans = [...currentPlans, ...data.plans.filter((p) => !currentPlans.some((c) => c.id === p.id))];
  usePlanStore.getState().replaceAll(mergedPlans);

  const currentHistory = useHistoryStore.getState().entries;
  const mergedHistory = [
    ...currentHistory,
    ...(data.history ?? []).filter((h) => !currentHistory.some((c) => c.id === h.id)),
  ];
  useHistoryStore.getState().replaceAll(mergedHistory);

  return true;
}
