import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Image, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { useSessionStore } from "@/store/useSessionStore";
import { colors } from "@/theme";
import { formatDuration } from "@/utils/time";
import { cancelWorkoutReminder, scheduleWorkoutReminder } from "@/utils/notifications";

type Props = NativeStackScreenProps<PlansStackParamList, "WorkoutSession">;

export default function WorkoutSessionScreen({ route, navigation }: Props) {
  const { planId } = route.params;
  const plan = usePlanStore((s) => s.getById(planId));
  const getExerciseById = useExerciseStore((s) => s.getById);

  const active = useSessionStore((s) => s.active);
  const startWorkout = useSessionStore((s) => s.startWorkout);
  const endWorkout = useSessionStore((s) => s.endWorkout);
  const setPhase = useSessionStore((s) => s.setPhase);
  const nextExercise = useSessionStore((s) => s.nextExercise);

  const [now, setNow] = useState(Date.now());

  // Avvia la sessione se non è già attiva per questa scheda
  useEffect(() => {
    if (!active || active.planId !== planId) {
      startWorkout(planId);
    }
    navigation.setOptions({ gestureEnabled: false, headerBackVisible: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick del cronometro
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Notifica promemoria quando l'app va in background durante l'allenamento
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (appState.current === "active" && next.match(/inactive|background/)) {
        if (active) {
          const elapsed = formatDuration((Date.now() - active.startedAt) / 1000);
          scheduleWorkoutReminder(elapsed);
        }
      } else if (next === "active") {
        cancelWorkoutReminder();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [active]);

  const ready = !!plan && !!active && active.planId === planId;

  const currentEntry = ready ? plan!.exercises[active!.currentIndex] : undefined;
  const nextEntry = ready ? plan!.exercises[active!.currentIndex + 1] : undefined;
  const currentExercise = currentEntry ? getExerciseById(currentEntry.exerciseId) : undefined;
  const nextExerciseData = nextEntry ? getExerciseById(nextEntry.exerciseId) : undefined;

  const totalElapsedSeconds = ready ? (now - active!.startedAt) / 1000 : 0;
  const phaseElapsedSeconds = ready ? (now - active!.phaseStartedAt) / 1000 : 0;
  const isLast = ready ? active!.currentIndex >= plan!.exercises.length - 1 : false;
  const restTarget = currentEntry?.restSeconds ?? 60;
  const restRemaining = Math.max(0, restTarget - phaseElapsedSeconds);

  const finishWorkout = (skipConfirm = false) => {
    const doFinish = () => {
      cancelWorkoutReminder();
      endWorkout();
      navigation.popToTop();
    };
    if (skipConfirm) {
      doFinish();
      return;
    }
    Alert.alert("Termina allenamento", "Vuoi terminare la sessione e fermare il cronometro?", [
      { text: "Continua ad allenarti", style: "cancel" },
      { text: "Termina", style: "destructive", onPress: doFinish },
    ]);
  };

  const goToRest = () => {
    if (isLast) {
      finishWorkout(true);
      return;
    }
    setPhase("rest");
  };

  const goToNextExercise = () => {
    if (!active) return;
    if (isLast) {
      finishWorkout(true);
      return;
    }
    nextExercise(active.currentIndex + 1);
  };

  // Passa automaticamente al prossimo esercizio quando il riposo finisce
  useEffect(() => {
    if (ready && active!.phase === "rest" && restRemaining <= 0) {
      goToNextExercise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, active?.phase, restRemaining]);

  if (!ready) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Preparazione allenamento...</Text>
      </View>
    );
  }

  const currentPlan = plan!;
  const currentActive = active!;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.chrono}>{formatDuration(totalElapsedSeconds)}</Text>
        <Text style={styles.progress}>
          Esercizio {currentActive.currentIndex + 1} / {currentPlan.exercises.length}
        </Text>
      </View>

      {currentActive.phase === "exercise" && currentExercise && (
        <View style={styles.body}>
          <Image source={{ uri: currentExercise.imageUrl }} style={styles.image} />
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.setsReps}>
            {currentEntry?.sets ?? "-"} serie × {currentEntry?.reps ?? "-"} ripetizioni
          </Text>
          <Pressable
            onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: currentExercise.id })}
          >
            <Text style={styles.infoLink}>Come si esegue →</Text>
          </Pressable>
        </View>
      )}

      {currentActive.phase === "rest" && (
        <View style={styles.body}>
          <Text style={styles.restTitle}>Riposo</Text>
          <Text style={styles.restCountdown}>{formatDuration(restRemaining)}</Text>
          {nextExerciseData && (
            <Text style={styles.nextUp}>Prossimo: {nextExerciseData.name}</Text>
          )}
        </View>
      )}

      <View style={styles.controls}>
        {currentActive.phase === "exercise" ? (
          <Pressable style={styles.primaryBtn} onPress={goToRest}>
            <Text style={styles.primaryBtnText}>{isLast ? "Termina esercizio" : "Esercizio completato →"}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryBtn} onPress={goToNextExercise}>
            <Text style={styles.primaryBtnText}>Salta riposo →</Text>
          </Pressable>
        )}
        <Pressable style={styles.stopBtn} onPress={() => finishWorkout(false)}>
          <Text style={styles.stopBtnText}>⏹  Termina allenamento</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: "space-between" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 60 },
  header: { alignItems: "center", marginTop: 10 },
  chrono: { color: colors.text, fontSize: 42, fontWeight: "700", fontVariant: ["tabular-nums"] },
  progress: { color: colors.textMuted, marginTop: 4 },
  body: { alignItems: "center", justifyContent: "center", flex: 1 },
  image: { width: 220, height: 220, borderRadius: 20, marginBottom: 20 },
  exerciseName: { color: colors.text, fontSize: 26, fontWeight: "700", textAlign: "center" },
  setsReps: { color: colors.textMuted, fontSize: 16, marginTop: 8 },
  infoLink: { color: colors.primary, marginTop: 16, fontWeight: "600" },
  restTitle: { color: colors.textMuted, fontSize: 20, fontWeight: "600" },
  restCountdown: { color: colors.warning, fontSize: 64, fontWeight: "800", marginTop: 12, fontVariant: ["tabular-nums"] },
  nextUp: { color: colors.text, fontSize: 16, marginTop: 20 },
  controls: { gap: 12, marginBottom: 10 },
  primaryBtn: { backgroundColor: colors.success, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  stopBtn: { backgroundColor: "transparent", borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: colors.danger },
  stopBtnText: { color: colors.danger, fontWeight: "700" },
});
