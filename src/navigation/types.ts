export type HomeStackParamList = {
  HomeMain: undefined;
};

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
  ExercisePicker: { excludeIds?: string[] };
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
  Home: undefined;
  Schede: undefined;
  Storico: undefined;
  Esercizi: undefined;
};
