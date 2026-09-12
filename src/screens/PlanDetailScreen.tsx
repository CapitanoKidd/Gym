import React, { useLayoutEffect, useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { colors } from "@/theme";
import ExerciseThumb from "@/components/ExerciseThumb";
import { buildExerciseGroups } from "@/utils/supersets";
import { PlanExercise } from "@/types";

type Props = NativeStackScreenProps<PlansStackParamList, "PlanDetail">;

export default function PlanDetailScreen({ route, navigation }: Props) {
  const { planId } = route.params;
  const plan = usePlanStore((s) => s.getById(planId));
  const deletePlan = usePlanStore((s) => s.deletePlan);
  const getExerciseById = useExerciseStore((s) => s.getById);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: plan?.name ?? "Scheda",
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("PlanEditor", { planId })} style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Modifica</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, plan?.name, planId]);

  const groups = useMemo(() => (plan ? buildExerciseGroups(plan.exercises) : []), [plan]);

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Scheda non trovata.</Text>
      </View>
    );
  }

  const confirmDeletePlan = () => {
    Alert.alert("Elimina scheda", `Vuoi eliminare "${plan.name}"?`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          deletePlan(plan.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const renderExerciseContent = (item: PlanExercise, index: number) => {
    const exercise = getExerciseById(item.exerciseId);
    if (!exercise) {
      return (
        <View style={styles.missingRowContent}>
          <Text style={styles.rowIndex}>{index + 1}</Text>
          <Text style={styles.missingText}>⚠️ Esercizio eliminato dalla libreria — rimuovilo da "Modifica"</Text>
        </View>
      );
    }
    return (
      <Pressable
        style={styles.rowContent}
        onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
      >
        <Text style={styles.rowIndex}>{index + 1}</Text>
        <ExerciseThumb exercise={exercise} size={56} borderRadius={10} style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={styles.rowMeta}>
            {item.sets} serie × {item.reps} rip.{item.weight ? `  ·  ${item.weight} kg` : ""}  ·  riposo {item.restSeconds}s
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>
        {plan.exercises.length === 0 && (
          <Text style={styles.empty}>
            Nessun esercizio in questa scheda.{"\n"}Tocca "Modifica" per aggiungerne.
          </Text>
        )}

        {groups.map((group) => {
          const startIndex = plan.exercises.findIndex((e) => e.id === group[0].id);
          const key = group.map((e) => e.id).join("-");

          if (group.length === 1) {
            return (
              <View key={key} style={styles.row}>
                {renderExerciseContent(group[0], startIndex)}
              </View>
            );
          }

          // Superserie: un unico bordo dorato avvolge tutti gli esercizi del gruppo,
          // per far capire a colpo d'occhio quali vanno eseguiti di fila senza riposo.
          return (
            <View key={key} style={styles.supersetGroup}>
              <Text style={styles.supersetGroupLabel}>🔗 Superserie</Text>
              {group.map((member, mi) => (
                <View key={member.id}>
                  {renderExerciseContent(member, startIndex + mi)}
                  {mi < group.length - 1 && <View style={styles.supersetDivider} />}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.deleteBtn} onPress={confirmDeletePlan}>
          <Text style={styles.deleteBtnText}>Elimina scheda</Text>
        </Pressable>
        <Pressable
          style={[styles.startBtn, plan.exercises.length === 0 && styles.startBtnDisabled]}
          disabled={plan.exercises.length === 0}
          onPress={() => navigation.navigate("WorkoutSession", { planId: plan.id })}
        >
          <Text style={styles.startBtnText}>▶  Inizia allenamento</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 60, lineHeight: 22 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowContent: { flexDirection: "row", alignItems: "center", padding: 10 },
  missingRowContent: { flexDirection: "row", alignItems: "center", padding: 10 },
  rowIndex: { color: colors.textMuted, fontWeight: "700", width: 22, textAlign: "center" },
  missingText: { color: colors.danger, flex: 1, fontSize: 13 },
  thumb: { width: 56, height: 56, borderRadius: 10, marginRight: 12 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rowMeta: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  supersetGroup: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.warning,
    paddingTop: 6,
    paddingBottom: 4,
  },
  supersetGroupLabel: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 12,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  supersetDivider: { height: 1, backgroundColor: colors.warning, opacity: 0.25, marginHorizontal: 12 },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteBtnText: { color: colors.danger, fontWeight: "600" },
  startBtn: { backgroundColor: colors.success, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
