export type ExercisesStackParamList = {
  ExercisesList: undefined;
  ExerciseDetail: { exerciseId: string };
  AddExercise: { exerciseId?: string } | undefined;
  ExerciseProgress: { exerciseId: string };
};

export type PlansStackParamList = {
  PlansList: undefined;
  PlanDetail: { planId: string };
  PlanEditor: { planId?: string };
  ExercisePicker: { onAdd: (exerciseId: string) => void; excludeIds?: string[] };
  ExerciseDetail: { exerciseId: string };
  ExerciseProgress: { exerciseId: string };
  WorkoutSession: { planId: string };
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryDetail: { entryId: string };
  Settings: undefined;
};

export type RootTabParamList = {
  Esercizi: undefined;
  Schede: undefined;
  Storico: undefined;
};
