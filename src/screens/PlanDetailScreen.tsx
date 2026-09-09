import React, { useLayoutEffect } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { colors } from "@/theme";

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

  return (
    <View style={styles.container}>
      <FlatList
        data={plan.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nessun esercizio in questa scheda.{"\n"}Tocca "Modifica" per aggiungerne.
          </Text>
        }
        renderItem={({ item, index }) => {
          const exercise = getExerciseById(item.exerciseId);
          if (!exercise) {
            return (
              <View style={[styles.row, styles.missingRow]}>
                <Text style={styles.rowIndex}>{index + 1}</Text>
                <Text style={styles.missingText}>⚠️ Esercizio eliminato dalla libreria — rimuovilo da "Modifica"</Text>
              </View>
            );
          }
          return (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
            >
              <Text style={styles.rowIndex}>{index + 1}</Text>
              <Image source={{ uri: exercise.imageUrl }} style={styles.thumb} />
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
        }}
      />

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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  rowIndex: { color: colors.textMuted, fontWeight: "700", width: 22, textAlign: "center" },
  missingRow: { borderColor: colors.danger },
  missingText: { color: colors.danger, flex: 1, fontSize: 13 },
  thumb: { width: 56, height: 56, borderRadius: 10, marginRight: 12 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rowMeta: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
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
