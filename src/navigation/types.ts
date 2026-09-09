export type ExercisesStackParamList = {
  ExercisesList: undefined;
  ExerciseDetail: { exerciseId: string };
  AddExercise: { exerciseId?: string } | undefined;
};

export type PlansStackParamList = {
  PlansList: undefined;
  PlanDetail: { planId: string };
  ExercisePicker: { planId: string };
  ExerciseDetail: { exerciseId: string };
  WorkoutSession: { planId: string };
};

export type RootTabParamList = {
  Esercizi: undefined;
  Schede: undefined;
};
