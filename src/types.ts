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
}

export interface PlanExercise {
  id: string; // id univoco della riga nella scheda (non dell'esercizio)
  exerciseId: string;
  restSeconds: number; // riposo dopo questo esercizio, default 60
  sets?: number;
  reps?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: PlanExercise[];
  createdAt: number;
}

export interface ActiveWorkout {
  planId: string;
  startedAt: number;
  currentIndex: number;
  phase: "exercise" | "rest";
  phaseStartedAt: number;
}
