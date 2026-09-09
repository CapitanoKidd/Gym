import React, { useLayoutEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore, makeDraftPlanExercise } from "@/store/usePlanStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { PlanExercise } from "@/types";
import { colors } from "@/theme";

type Props = NativeStackScreenProps<PlansStackParamList, "PlanEditor">;

export default function PlanEditorScreen({ route, navigation }: Props) {
  const { planId } = route.params ?? {};
  const existingPlan = usePlanStore((s) => (planId ? s.getById(planId) : undefined));
  const createPlan = usePlanStore((s) => s.createPlan);
  const updatePlan = usePlanStore((s) => s.updatePlan);
  const getExerciseById = useExerciseStore((s) => s.getById);

  const [name, setName] = useState(existingPlan?.name ?? "");
  const [draft, setDraft] = useState<PlanExercise[]>(
    existingPlan ? existingPlan.exercises.map((e) => ({ ...e })) : []
  );
  const [dirty, setDirty] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: planId ? "Modifica scheda" : "Nuova scheda" });
  }, [navigation, planId]);

  const openPicker = () => {
    navigation.navigate("ExercisePicker", {
      excludeIds: draft.map((d) => d.exerciseId),
      onAdd: (exerciseId: string) => {
        setDraft((prev) => [...prev, makeDraftPlanExercise(exerciseId)]);
        setDirty(true);
      },
    });
  };

  const removeRow = (rowId: string) => {
    setDraft((prev) => prev.filter((d) => d.id !== rowId));
    setDirty(true);
  };

  const patchRow = (rowId: string, patch: Partial<PlanExercise>) => {
    setDraft((prev) => prev.map((d) => (d.id === rowId ? { ...d, ...patch } : d)));
    setDirty(true);
  };

  const canSave = name.trim().length > 0;

  const save = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (planId) {
      updatePlan(planId, trimmedName, draft);
      navigation.replace("PlanDetail", { planId });
    } else {
      const plan = createPlan(trimmedName, draft);
      navigation.replace("PlanDetail", { planId: plan.id });
    }
  };

  const handleCancel = () => {
    if (!dirty && !!existingPlan) {
      navigation.goBack();
      return;
    }
    if (!dirty && !existingPlan && draft.length === 0 && name.trim().length === 0) {
      navigation.goBack();
      return;
    }
    Alert.alert("Annullare le modifiche?", "Le modifiche non salvate andranno perse.", [
      { text: "Continua a modificare", style: "cancel" },
      { text: "Annulla modifiche", style: "destructive", onPress: () => navigation.goBack() },
    ]);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PlanExercise>) => {
    const exercise = getExerciseById(item.exerciseId);
    if (!exercise) return null;
    return (
      <ScaleDecorator>
        <View style={[styles.row, isActive && styles.rowActive]}>
          <View style={styles.rowHeader}>
            <Pressable
              onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
              style={styles.rowHeaderMain}
            >
              <Image source={{ uri: exercise.imageUrl }} style={styles.thumb} />
              <Text style={styles.rowTitle} numberOfLines={2}>
                {exercise.name}
              </Text>
            </Pressable>
            <Pressable onPress={() => removeRow(item.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </Pressable>
            <Pressable onPressIn={drag} style={styles.dragHandle}>
              <Text style={styles.dragHandleText}>≡</Text>
            </Pressable>
          </View>

          <View style={styles.fieldsRow}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Serie</Text>
              <View style={styles.stepper}>
                <Pressable onPress={() => patchRow(item.id, { sets: Math.max(1, item.sets - 1) })} style={styles.stepBtn}>
                  <Text style={styles.stepBtnText}>–</Text>
                </Pressable>
                <Text style={styles.stepValue}>{item.sets}</Text>
                <Pressable onPress={() => patchRow(item.id, { sets: item.sets + 1 })} style={styles.stepBtn}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.field, { flex: 1.3 }]}>
              <Text style={styles.fieldLabel}>Ripetizioni</Text>
              <TextInput
                style={styles.repsInput}
                value={item.reps}
                onChangeText={(v) => patchRow(item.id, { reps: v })}
                placeholder="10-12"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Peso (kg)</Text>
              <TextInput
                style={styles.repsInput}
                value={item.weight != null ? String(item.weight) : ""}
                onChangeText={(v) => {
                  const num = v.replace(",", ".");
                  const parsed = num.trim() === "" ? undefined : parseFloat(num);
                  patchRow(item.id, { weight: parsed != null && !isNaN(parsed) ? parsed : undefined });
                }}
                keyboardType="decimal-pad"
                placeholder="–"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.restRow}>
            <Text style={styles.fieldLabel}>Riposo dopo l'esercizio</Text>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => patchRow(item.id, { restSeconds: Math.max(0, item.restSeconds - 15) })}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>–</Text>
              </Pressable>
              <Text style={styles.stepValue}>{item.restSeconds}s</Text>
              <Pressable
                onPress={() => patchRow(item.id, { restSeconds: item.restSeconds + 15 })}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.nameSection}>
          <Text style={styles.fieldLabel}>Nome scheda</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setDirty(true);
            }}
            placeholder="Es. Push Day"
            placeholderTextColor={colors.textMuted}
            autoFocus={!existingPlan}
          />
        </View>

        <DraggableFlatList
          data={draft}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => {
            setDraft(data);
            setDirty(true);
          }}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nessun esercizio ancora.{"\n"}Tocca "Aggiungi esercizi" per iniziare a costruire la scheda.
            </Text>
          }
        />

        <View style={styles.bottomBar}>
          <Pressable style={styles.addBtn} onPress={openPicker}>
            <Text style={styles.addBtnText}>+ Aggiungi esercizi</Text>
          </Pressable>
          <View style={styles.saveRow}>
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Annulla</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} disabled={!canSave} onPress={save}>
              <Text style={styles.saveBtnText}>💾 Salva scheda</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  nameSection: { paddingHorizontal: 16, paddingTop: 14 },
  nameInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40, lineHeight: 22 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  rowActive: { opacity: 0.9, borderColor: colors.primary },
  rowHeader: { flexDirection: "row", alignItems: "center" },
  rowHeaderMain: { flexDirection: "row", alignItems: "center", flex: 1 },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "600", marginLeft: 10, flex: 1 },
  removeBtn: { padding: 8 },
  removeBtnText: { color: colors.danger, fontSize: 16 },
  dragHandle: { padding: 8 },
  dragHandleText: { color: colors.textMuted, fontSize: 22 },
  fieldsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  field: { flex: 1 },
  fieldLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  repsInput: {
    backgroundColor: colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnText: { color: colors.text, fontWeight: "700", fontSize: 16 },
  stepValue: { color: colors.text, fontSize: 14, minWidth: 30, textAlign: "center" },
  restRow: { marginTop: 12 },
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
  saveRow: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: { color: colors.textMuted, fontWeight: "600" },
  saveBtn: { flex: 2, backgroundColor: colors.success, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
