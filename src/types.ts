export type MuscleGroup =
  | "Petto"
  | "Schiena"
  | "Gambe"
  | "Spalle"
  | "Bicipiti"
  | "Tricipiti"
  | "Addominali"
  | "Glutei"
  | "Cardio"
  | "Full Body";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  /** URL di una foto/immagine reale, opzionale. Se assente si mostra un'icona per gruppo muscolare. */
  imageUrl?: string;
  description: string;
  doList: string[];
  dontList: string[];
  isCustom: boolean;
  /** Altri nomi con cui è conosciuto lo stesso esercizio (es. "push up" per "Flessioni"), usati dalla ricerca. */
  aliases: string[];
}

export interface PlanExercise {
  id: string; // id univoco della riga nella scheda (non dell'esercizio)
  exerciseId: string;
  restSeconds: number; // riposo tra le serie e dopo l'esercizio/superserie, default 60
  sets: number;
  reps: string;
  /** Peso suggerito in kg, opzionale */
  weight?: number;
  /** true se questo esercizio va eseguito in superserie col successivo nella scheda
   * (di fila, senza riposo tra loro; il riposo si applica solo dopo l'ultimo della serie). */
  supersetWithNext?: boolean;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: PlanExercise[];
  createdAt: number;
}

/** Stato di una singola serie eseguita durante l'allenamento. */
export interface SetLogEntry {
  weight?: number;
  completed: boolean;
}

export interface SessionLogEntry {
  note?: string;
  /** Una entry per ogni serie prevista dell'esercizio (indice = numero serie, 0-based). */
  setLogs: SetLogEntry[];
}

export interface ActiveWorkout {
  planId: string;
  startedAt: number;
  phase: "exercise" | "rest";
  phaseStartedAt: number;
  /** Indice del gruppo corrente (un esercizio singolo, o una superserie di più esercizi collegati). */
  groupIndex: number;
  /** Indice dell'esercizio corrente all'interno del gruppo (0 se non è una superserie). */
  memberIndex: number;
  /** Numero di serie corrente (0-based) per l'esercizio/gruppo corrente. */
  round: number;
  /** Durata del riposo in corso (impostata quando si entra in fase "rest"). */
  restTargetSeconds: number;
  /** Log delle serie svolte in questa sessione, per id della riga PlanExercise. */
  logs: Record<string, SessionLogEntry>;
}

export interface HistoryExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  /** Peso "rappresentativo" (l'ultimo inserito) per compatibilità con lo storico/grafico progressi. */
  weight?: number;
  /** Peso usato in ciascuna serie, se disponibile (una entry per serie, può contenere undefined). */
  setWeights?: (number | undefined)[];
  note?: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  planId: string;
  planName: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  exercises: HistoryExerciseLog[];
}

/** Formato del file di backup esportabile/importabile dall'app */
export interface BackupData {
  version: 1;
  exportedAt: number;
  exercises: Exercise[];
  plans: WorkoutPlan[];
  history: WorkoutHistoryEntry[];
}
