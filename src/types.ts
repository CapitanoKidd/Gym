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
  imageUrl: string;
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
  restSeconds: number; // riposo dopo questo esercizio, default 60
  sets: number;
  reps: string;
  /** Peso suggerito in kg, opzionale */
  weight?: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: PlanExercise[];
  createdAt: number;
}

export interface SessionLogEntry {
  note?: string;
  weight?: number;
}

export interface ActiveWorkout {
  planId: string;
  startedAt: number;
  currentIndex: number;
  phase: "exercise" | "rest";
  phaseStartedAt: number;
  /** Note/peso inseriti durante la sessione corrente, per id della riga PlanExercise */
  logs: Record<string, SessionLogEntry>;
}

export interface HistoryExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  weight?: number;
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
