import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { setAudioModeAsync } from "expo-audio";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { colors } from "@/theme";
import { formatDuration } from "@/utils/time";
import { cancelWorkoutReminder, scheduleWorkoutReminder } from "@/utils/notifications";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { HistoryExerciseLog } from "@/types";
import ExerciseThumb from "@/components/ExerciseThumb";
import { useRestEndSound } from "@/utils/sound";

type Props = NativeStackScreenProps<PlansStackParamList, "WorkoutSession">;

export default function WorkoutSessionScreen({ route, navigation }: Props) {
  // Tiene lo schermo acceso per tutta la durata dell'allenamento: durante il riposo
  // spesso non si tocca il telefono e senza questo lo schermo si spegnerebbe da solo.
  useKeepAwake();

  const playRestEndSound = useRestEndSound();
  // Il beep di fine riposo è un allarme funzionale (serve a farsi notare), non un suono
  // decorativo: deve sentirsi anche se il telefono è in modalità silenziosa/vibrazione.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const { planId } = route.params;
  const plan = usePlanStore((s) => s.getById(planId));
  const getExerciseById = useExerciseStore((s) => s.getById);
  const addHistoryEntry = useHistoryStore((s) => s.addEntry);
  const getLastWeightForExercise = useHistoryStore((s) => s.getLastWeightForExercise);

  const active = useSessionStore((s) => s.active);
  const startWorkout = useSessionStore((s) => s.startWorkout);
  const endWorkout = useSessionStore((s) => s.endWorkout);
  const setPhase = useSessionStore((s) => s.setPhase);
  const nextExercise = useSessionStore((s) => s.nextExercise);
  const setNote = useSessionStore((s) => s.setNote);
  const setWeight = useSessionStore((s) => s.setWeight);

  const [now, setNow] = useState(Date.now());
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [weightDraft, setWeightDraft] = useState("");

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
  const currentLog = currentEntry ? active?.logs[currentEntry.id] : undefined;
  // Peso da mostrare/suggerire: quello già inserito in questa sessione, altrimenti quello
  // impostato nella scheda, altrimenti l'ultimo peso usato per questo esercizio nello storico.
  const lastKnownWeight = currentEntry ? getLastWeightForExercise(currentEntry.exerciseId) : undefined;
  const suggestedWeight = currentLog?.weight ?? currentEntry?.weight ?? lastKnownWeight;
  const isWeightFromHistory = currentLog?.weight == null && currentEntry?.weight == null && lastKnownWeight != null;

  const finishWorkout = (skipConfirm = false) => {
    const doFinish = () => {
      cancelWorkoutReminder();
      if (ready) {
        const exercises: HistoryExerciseLog[] = plan!.exercises
          .slice(0, active!.currentIndex + 1)
          .map((pe) => {
            const ex = getExerciseById(pe.exerciseId);
            const log = active!.logs[pe.id];
            return {
              exerciseId: pe.exerciseId,
              exerciseName: ex?.name ?? "Esercizio",
              sets: pe.sets,
              reps: pe.reps,
              weight: log?.weight ?? pe.weight,
              note: log?.note,
            };
          });
        addHistoryEntry({
          id: uuidv4(),
          planId: plan!.id,
          planName: plan!.name,
          startedAt: active!.startedAt,
          endedAt: Date.now(),
          durationSeconds: Math.round((Date.now() - active!.startedAt) / 1000),
          exercises,
        });
      }
      endWorkout();
      navigation.popToTop();
    };
    if (skipConfirm) {
      doFinish();
      return;
    }
    Alert.alert("Termina allenamento", "Vuoi terminare la sessione e fermare il cronometro? Verrà salvata nello storico.", [
      { text: "Continua ad allenarti", style: "cancel" },
      { text: "Termina", style: "destructive", onPress: doFinish },
    ]);
  };

  // Il tasto fisico "indietro" (Android) durante l'allenamento chiede conferma invece di uscire silenziosamente
  useEffect(() => {
    if (!ready) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      finishWorkout(false);
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

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

  // Passa automaticamente al prossimo esercizio quando il riposo finisce, con vibrazione + beep
  useEffect(() => {
    if (ready && active!.phase === "rest" && restRemaining <= 0) {
      Vibration.vibrate([0, 250, 120, 250]);
      playRestEndSound();
      goToNextExercise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, active?.phase, restRemaining]);

  const openNoteModal = () => {
    if (!currentEntry) return;
    setNoteDraft(currentLog?.note ?? "");
    setWeightDraft(suggestedWeight != null ? String(suggestedWeight) : "");
    setNoteModalVisible(true);
  };

  const saveNoteModal = () => {
    if (!currentEntry) return;
    setNote(currentEntry.id, noteDraft.trim());
    const parsedWeight = parseFloat(weightDraft.replace(",", "."));
    setWeight(currentEntry.id, weightDraft.trim() === "" || isNaN(parsedWeight) ? undefined : parsedWeight);
    setNoteModalVisible(false);
  };

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
          <ExerciseThumb exercise={currentExercise} size={220} borderRadius={20} style={styles.image} />
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.setsReps}>
            {currentEntry?.sets ?? "-"} serie × {currentEntry?.reps ?? "-"} ripetizioni
            {suggestedWeight != null ? `  ·  ${suggestedWeight} kg` : ""}
          </Text>
          {isWeightFromHistory && <Text style={styles.suggestedHint}>💡 Ultima volta: {suggestedWeight} kg</Text>}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: currentExercise.id })}
            >
              <Text style={styles.infoLink}>Come si esegue →</Text>
            </Pressable>
            <Pressable onPress={openNoteModal} style={styles.noteBtn}>
              <Text style={styles.noteBtnText}>{currentLog?.note ? "📝 Nota salvata" : "📝 Aggiungi nota / peso"}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {currentActive.phase === "exercise" && !currentExercise && (
        <View style={styles.body}>
          <Text style={styles.missingExerciseText}>
            ⚠️ Questo esercizio è stato eliminato dalla libreria.{"\n"}Puoi comunque proseguire l'allenamento.
          </Text>
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

      <Modal visible={noteModalVisible} transparent animationType="fade" onRequestClose={() => setNoteModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{currentExercise?.name}</Text>

            <Text style={styles.modalLabel}>Peso usato (kg)</Text>
            <TextInput
              style={styles.modalInput}
              value={weightDraft}
              onChangeText={setWeightDraft}
              keyboardType="decimal-pad"
              placeholder="Es. 40"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.modalLabel}>Nota</Text>
            <TextInput
              style={[styles.modalInput, styles.modalMultiline]}
              value={noteDraft}
              onChangeText={setNoteDraft}
              multiline
              placeholder="Es. difficile sull'ultima serie, provare 35kg la prossima volta"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setNoteModalVisible(false)}>
                <Text style={styles.modalCancelText}>Annulla</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={saveNoteModal}>
                <Text style={styles.modalConfirmText}>Salva</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  suggestedHint: { color: colors.warning, fontSize: 13, marginTop: 6, fontWeight: "600" },
  missingExerciseText: { color: colors.danger, fontSize: 16, textAlign: "center", lineHeight: 24 },
  actionRow: { alignItems: "center", marginTop: 18, gap: 14 },
  infoLink: { color: colors.primary, fontWeight: "600" },
  noteBtn: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteBtnText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  restTitle: { color: colors.textMuted, fontSize: 20, fontWeight: "600" },
  restCountdown: { color: colors.warning, fontSize: 64, fontWeight: "800", marginTop: 12, fontVariant: ["tabular-nums"] },
  nextUp: { color: colors.text, fontSize: 16, marginTop: 20 },
  controls: { gap: 12, marginBottom: 10 },
  primaryBtn: { backgroundColor: colors.success, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  stopBtn: { backgroundColor: "transparent", borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: colors.danger },
  stopBtnText: { color: colors.danger, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.text, fontSize: 17, fontWeight: "700", marginBottom: 14 },
  modalLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 6, marginTop: 10 },
  modalInput: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalMultiline: { minHeight: 70, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 18 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: colors.textMuted, fontWeight: "600" },
  modalConfirm: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  modalConfirmText: { color: "#fff", fontWeight: "700" },
});
