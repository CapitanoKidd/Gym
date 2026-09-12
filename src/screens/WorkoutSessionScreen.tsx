import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { buildExerciseGroups, isLastSetOfMember } from "@/utils/supersets";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { HistoryExerciseLog, PlanExercise } from "@/types";
import ExerciseThumb from "@/components/ExerciseThumb";
import { useRestEndSound } from "@/utils/sound";

type Props = NativeStackScreenProps<PlansStackParamList, "WorkoutSession">;

function parseWeightInput(text: string): number | undefined {
  const num = text.replace(",", ".").trim();
  if (num === "") return undefined;
  const parsed = parseFloat(num);
  return isNaN(parsed) ? undefined : parsed;
}

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
  const completeCurrentSet = useSessionStore((s) => s.completeCurrentSet);
  const skipRest = useSessionStore((s) => s.skipRest);
  const setSetWeight = useSessionStore((s) => s.setSetWeight);
  const setNote = useSessionStore((s) => s.setNote);

  const [now, setNow] = useState(Date.now());
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [weightInput, setWeightInput] = useState("");

  // Avvia la sessione se non è già attiva per questa scheda
  useEffect(() => {
    if (plan && (!active || active.planId !== planId)) {
      startWorkout(plan);
    }
    navigation.setOptions({ gestureEnabled: false, headerBackVisible: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

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

  const groups = useMemo(() => (plan ? buildExerciseGroups(plan.exercises) : []), [plan]);
  const currentGroup = ready ? groups[active!.groupIndex] : undefined;
  const currentMember: PlanExercise | undefined = currentGroup?.[active!.memberIndex];
  const currentExercise = currentMember ? getExerciseById(currentMember.exerciseId) : undefined;
  const currentLog = currentMember ? active?.logs[currentMember.id] : undefined;
  const isSuperset = (currentGroup?.length ?? 0) > 1;
  const partnerNames = isSuperset
    ? currentGroup!
        .filter((m) => m.id !== currentMember?.id)
        .map((m) => getExerciseById(m.exerciseId)?.name ?? "Esercizio")
    : [];

  // Peso da suggerire per la serie corrente: quello inserito nella serie precedente di
  // questo esercizio in questa sessione, altrimenti quello impostato nella scheda,
  // altrimenti l'ultimo peso usato per questo esercizio nello storico.
  const suggestedWeight = useMemo(() => {
    if (!currentMember || !active) return undefined;
    const prevRoundWeight = currentLog?.setLogs
      .slice(0, active.round)
      .reverse()
      .find((s) => s.weight != null)?.weight;
    return prevRoundWeight ?? currentMember.weight ?? getLastWeightForExercise(currentMember.exerciseId);
  }, [currentMember, currentLog, active?.round, getLastWeightForExercise]);
  const isWeightFromHistory =
    currentMember?.weight == null &&
    active != null &&
    currentLog?.setLogs.slice(0, active.round).every((s) => s.weight == null) &&
    suggestedWeight != null;

  // Precompila il campo peso della serie corrente quando cambia esercizio/round
  useEffect(() => {
    if (!ready || active!.phase !== "exercise") return;
    const existing = currentLog?.setLogs[active!.round]?.weight;
    setWeightInput(existing != null ? String(existing) : suggestedWeight != null ? String(suggestedWeight) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, active?.phase, active?.groupIndex, active?.memberIndex, active?.round]);

  const totalElapsedSeconds = ready ? (now - active!.startedAt) / 1000 : 0;
  const phaseElapsedSeconds = ready ? (now - active!.phaseStartedAt) / 1000 : 0;
  const restTarget = active?.restTargetSeconds ?? 60;
  const restRemaining = Math.max(0, restTarget - phaseElapsedSeconds);

  // Progresso complessivo mostrato in alto: quale esercizio della scheda (in ordine) è in corso.
  const overallIndex = plan && currentMember ? plan.exercises.findIndex((e) => e.id === currentMember.id) : -1;
  const overallTotal = plan?.exercises.length ?? 0;

  const finishWorkout = (skipConfirm = false) => {
    const doFinish = () => {
      cancelWorkoutReminder();
      if (ready && plan) {
        const exercises: HistoryExerciseLog[] = plan.exercises
          .map((pe): HistoryExerciseLog | null => {
            const log = active!.logs[pe.id];
            const completedSets = log?.setLogs.filter((s) => s.completed) ?? [];
            if (completedSets.length === 0) return null;
            const ex = getExerciseById(pe.exerciseId);
            const lastWeight = [...completedSets].reverse().find((s) => s.weight != null)?.weight;
            return {
              exerciseId: pe.exerciseId,
              exerciseName: ex?.name ?? "Esercizio",
              sets: completedSets.length,
              reps: pe.reps,
              weight: lastWeight,
              setWeights: log.setLogs.map((s) => s.weight),
              note: log?.note,
            };
          })
          .filter((e): e is HistoryExerciseLog => e != null);
        addHistoryEntry({
          id: uuidv4(),
          planId: plan.id,
          planName: plan.name,
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

  // Passa automaticamente alla serie/esercizio successivo quando il riposo finisce, con vibrazione + beep
  useEffect(() => {
    if (ready && active!.phase === "rest" && restRemaining <= 0) {
      Vibration.vibrate([0, 250, 120, 250]);
      playRestEndSound();
      skipRest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, active?.phase, restRemaining]);

  const handleCompleteSet = () => {
    if (!plan) return;
    const weight = parseWeightInput(weightInput);
    const more = completeCurrentSet(plan, weight);
    if (!more) {
      finishWorkout(true);
    }
  };

  const openNoteModal = () => {
    if (!currentMember) return;
    setNoteDraft(currentLog?.note ?? "");
    setNoteModalVisible(true);
  };

  const saveNoteModal = () => {
    if (!currentMember) return;
    setNote(currentMember.id, noteDraft.trim());
    setNoteModalVisible(false);
  };

  if (!ready) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Preparazione allenamento...</Text>
      </View>
    );
  }

  const currentActive = active!;
  const isLastSet = currentGroup && currentMember ? isLastSetOfMember(currentGroup, currentActive.memberIndex, currentActive.round) : true;

  // Prossimo esercizio da mostrare durante il riposo (chi tocca dopo, tra un round e l'altro
  // o all'inizio del gruppo successivo).
  const nextGroup = groups[currentActive.groupIndex];
  const nextMember = nextGroup?.[currentActive.memberIndex];
  const nextExerciseData = nextMember ? getExerciseById(nextMember.exerciseId) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.chrono}>{formatDuration(totalElapsedSeconds)}</Text>
        <Text style={styles.progress}>
          Esercizio {overallIndex >= 0 ? overallIndex + 1 : "-"} / {overallTotal}
        </Text>
      </View>

      {currentActive.phase === "exercise" && currentMember && (
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          {currentExercise ? (
            <>
              <ExerciseThumb exercise={currentExercise} size={140} borderRadius={18} style={styles.image} />
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            </>
          ) : (
            <Text style={styles.missingExerciseText}>⚠️ Esercizio eliminato dalla libreria</Text>
          )}

          {isSuperset && (
            <View style={styles.supersetBadge}>
              <Text style={styles.supersetBadgeText}>🔗 Superserie con: {partnerNames.join(", ")}</Text>
            </View>
          )}

          <Text style={styles.setsReps}>
            {currentMember.sets} serie × {currentMember.reps} ripetizioni
          </Text>

          {currentExercise && (
            <Pressable onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: currentExercise.id })}>
              <Text style={styles.infoLink}>Come si esegue →</Text>
            </Pressable>
          )}

          {/* Le serie: quelle già fatte restano visibili col peso (modificabile), quella
              corrente ha il campo peso in evidenza + il tasto per completarla, quelle
              future sono solo un'anteprima. */}
          <View style={styles.setsCard}>
            {Array.from({ length: currentMember.sets }).map((_, round) => {
              const setLog = currentLog?.setLogs[round];
              const isDone = round < currentActive.round || (round === currentActive.round && setLog?.completed);
              const isCurrent = round === currentActive.round && !setLog?.completed;
              const isUpcoming = round > currentActive.round;

              if (isUpcoming) {
                return (
                  <View key={round} style={[styles.setRow, styles.setRowUpcoming]}>
                    <Text style={styles.setRowLabelMuted}>Serie {round + 1}</Text>
                    <Text style={styles.setRowMuted}>{currentMember.reps} rip.</Text>
                  </View>
                );
              }

              return (
                <View key={round} style={[styles.setRow, isCurrent && styles.setRowCurrent]}>
                  <Text style={[styles.setRowLabel, isCurrent && styles.setRowLabelCurrent]}>
                    {isDone ? "✅" : "▶️"} Serie {round + 1}
                  </Text>
                  <View style={styles.weightFieldWrap}>
                    <TextInput
                      style={[styles.weightInput, isCurrent && styles.weightInputCurrent]}
                      value={isCurrent ? weightInput : setLog?.weight != null ? String(setLog.weight) : ""}
                      onChangeText={(v) => {
                        if (isCurrent) {
                          setWeightInput(v);
                        } else {
                          setSetWeight(currentMember.id, round, parseWeightInput(v));
                        }
                      }}
                      keyboardType="decimal-pad"
                      placeholder="peso"
                      placeholderTextColor={colors.textMuted}
                    />
                    <Text style={styles.weightUnit}>kg</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {isWeightFromHistory && <Text style={styles.suggestedHint}>💡 Ultima volta: {suggestedWeight} kg</Text>}

          <Pressable onPress={openNoteModal} style={styles.noteBtn}>
            <Text style={styles.noteBtnText}>{currentLog?.note ? "📝 Nota salvata" : "📝 Nota (opzionale)"}</Text>
          </Pressable>
        </ScrollView>
      )}

      {currentActive.phase === "rest" && (
        <View style={styles.body}>
          <Text style={styles.restTitle}>Riposo</Text>
          <Text style={styles.restCountdown}>{formatDuration(restRemaining)}</Text>
          {nextExerciseData && <Text style={styles.nextUp}>Prossimo: {nextExerciseData.name}</Text>}
        </View>
      )}

      <View style={styles.controls}>
        {currentActive.phase === "exercise" ? (
          <Pressable style={styles.primaryBtn} onPress={handleCompleteSet}>
            <Text style={styles.primaryBtnText}>
              {isLastSet ? "✅ Esercizio completato" : "✅ Serie completata"}
            </Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryBtn} onPress={skipRest}>
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{currentExercise?.name}</Text>

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
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 20 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 60 },
  header: { alignItems: "center", marginBottom: 6 },
  chrono: { color: colors.text, fontSize: 42, fontWeight: "700", fontVariant: ["tabular-nums"] },
  progress: { color: colors.textMuted, marginTop: 4 },
  body: { flex: 1 },
  bodyContent: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 20 },
  image: { width: 140, height: 140, borderRadius: 18, marginTop: 6, marginBottom: 12 },
  exerciseName: { color: colors.text, fontSize: 22, fontWeight: "700", textAlign: "center" },
  supersetBadge: {
    marginTop: 8,
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  supersetBadgeText: { color: colors.warning, fontSize: 12, fontWeight: "700", textAlign: "center" },
  setsReps: { color: colors.textMuted, fontSize: 15, marginTop: 8 },
  suggestedHint: { color: colors.warning, fontSize: 13, marginTop: 10, fontWeight: "600" },
  missingExerciseText: { color: colors.danger, fontSize: 16, textAlign: "center", lineHeight: 24, marginTop: 20 },
  infoLink: { color: colors.primary, fontWeight: "600", marginTop: 10 },
  setsCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 18,
    overflow: "hidden",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setRowUpcoming: { opacity: 0.5 },
  setRowCurrent: { backgroundColor: "rgba(52, 199, 89, 0.08)" },
  setRowLabel: { color: colors.text, fontSize: 15, fontWeight: "600" },
  setRowLabelCurrent: { color: colors.success },
  setRowLabelMuted: { color: colors.textMuted, fontSize: 15, fontWeight: "600" },
  setRowMuted: { color: colors.textMuted, fontSize: 13 },
  weightFieldWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  weightInput: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 76,
    textAlign: "center",
  },
  weightInputCurrent: { borderColor: colors.success, borderWidth: 2 },
  weightUnit: { color: colors.textMuted, fontSize: 13 },
  noteBtn: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  noteBtnText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  restTitle: { color: colors.textMuted, fontSize: 20, fontWeight: "600", textAlign: "center", marginTop: 60 },
  restCountdown: { color: colors.warning, fontSize: 64, fontWeight: "800", marginTop: 12, fontVariant: ["tabular-nums"], textAlign: "center" },
  nextUp: { color: colors.text, fontSize: 16, marginTop: 20, textAlign: "center" },
  controls: { gap: 12, paddingHorizontal: 20, paddingBottom: 10, paddingTop: 10 },
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
