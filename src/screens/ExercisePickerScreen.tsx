import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { useExerciseStore } from "@/store/useExerciseStore";
import { usePlanStore } from "@/store/usePlanStore";
import ExerciseCard from "@/components/ExerciseCard";
import { colors } from "@/theme";
import { Pressable } from "react-native";

type Props = NativeStackScreenProps<PlansStackParamList, "ExercisePicker">;

export default function ExercisePickerScreen({ route, navigation }: Props) {
  const { planId } = route.params;
  const exercises = useExerciseStore((s) => s.exercises);
  const addExerciseToPlan = usePlanStore((s) => s.addExerciseToPlan);
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())),
    [exercises, query]
  );

  const handleAdd = (exerciseId: string) => {
    addExerciseToPlan(planId, exerciseId);
    setAdded((prev) => new Set(prev).add(exerciseId));
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cerca esercizio..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => handleAdd(item.id)}
            rightAccessory={
              <Pressable style={styles.addBtn} onPress={() => handleAdd(item.id)}>
                <Text style={styles.addBtnText}>{added.has(item.id) ? "✓ Aggiunto" : "+ Aggiungi"}</Text>
              </Pressable>
            }
          />
        )}
      />
      <Pressable style={styles.doneBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.doneBtnText}>Fatto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 12 },
  search: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  doneBtn: { backgroundColor: colors.cardAlt, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 10 },
  doneBtnText: { color: colors.text, fontWeight: "700" },
});
