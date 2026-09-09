import React, { useLayoutEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { PlanExercise } from "@/types";
import { colors } from "@/theme";
import { Image } from "react-native";

type Props = NativeStackScreenProps<PlansStackParamList, "PlanDetail">;

export default function PlanDetailScreen({ route, navigation }: Props) {
  const { planId } = route.params;
  const plan = usePlanStore((s) => s.getById(planId));
  const reorderPlanExercises = usePlanStore((s) => s.reorderPlanExercises);
  const removeExerciseFromPlan = usePlanStore((s) => s.removeExerciseFromPlan);
  const updateRestSeconds = usePlanStore((s) => s.updateRestSeconds);
  const deletePlan = usePlanStore((s) => s.deletePlan);
  const getExerciseById = useExerciseStore((s) => s.getById);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: plan?.name ?? "Scheda",
      headerRight: () => (
        <Pressable onPress={confirmDeletePlan} style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: colors.danger, fontWeight: "600" }}>Elimina</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, plan?.name]);

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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PlanExercise>) => {
    const exercise = getExerciseById(item.exerciseId);
    if (!exercise) return null;
    return (
      <ScaleDecorator>
        <View style={[styles.row, isActive && styles.rowActive]}>
          <Pressable
            onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
            style={styles.rowMain}
          >
            <Image source={{ uri: exercise.imageUrl }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {exercise.name}
              </Text>
              <View style={styles.restRow}>
                <Text style={styles.restLabel}>Riposo:</Text>
                <Pressable
                  onPress={() => updateRestSeconds(plan.id, item.id, item.restSeconds - 15)}
                  style={styles.restBtn}
                >
                  <Text style={styles.restBtnText}>–</Text>
                </Pressable>
                <Text style={styles.restValue}>{item.restSeconds}s</Text>
                <Pressable
                  onPress={() => updateRestSeconds(plan.id, item.id, item.restSeconds + 15)}
                  style={styles.restBtn}
                >
                  <Text style={styles.restBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
          <Pressable onPress={() => removeExerciseFromPlan(plan.id, item.id)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>✕</Text>
          </Pressable>
          <Pressable onPressIn={drag} style={styles.dragHandle}>
            <Text style={styles.dragHandleText}>≡</Text>
          </Pressable>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <DraggableFlatList
          data={plan.exercises}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => reorderPlanExercises(plan.id, data)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nessun esercizio in questa scheda.{"\n"}Tocca "Aggiungi esercizi" per iniziare.
            </Text>
          }
        />

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate("ExercisePicker", { planId: plan.id })}
          >
            <Text style={styles.addBtnText}>+ Aggiungi esercizi</Text>
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
    </GestureHandlerRootView>
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
    paddingRight: 8,
  },
  rowActive: { opacity: 0.85, borderColor: colors.primary },
  rowMain: { flexDirection: "row", alignItems: "center", flex: 1 },
  thumb: { width: 64, height: 64, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "600", marginLeft: 12, marginTop: 10 },
  restRow: { flexDirection: "row", alignItems: "center", marginLeft: 12, marginTop: 6, marginBottom: 8, gap: 8 },
  restLabel: { color: colors.textMuted, fontSize: 12 },
  restBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  restBtnText: { color: colors.text, fontWeight: "700" },
  restValue: { color: colors.text, fontSize: 13, minWidth: 34, textAlign: "center" },
  removeBtn: { padding: 8 },
  removeBtnText: { color: colors.danger, fontSize: 16 },
  dragHandle: { padding: 8 },
  dragHandleText: { color: colors.textMuted, fontSize: 22 },
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
  addBtn: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtnText: { color: colors.text, fontWeight: "600" },
  startBtn: { backgroundColor: colors.success, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
