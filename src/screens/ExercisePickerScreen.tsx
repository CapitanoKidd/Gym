import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { useExerciseStore, MUSCLE_GROUPS } from "@/store/useExerciseStore";
import ExerciseCard from "@/components/ExerciseCard";
import { colors } from "@/theme";
import { searchExercises } from "@/utils/search";

type Props = NativeStackScreenProps<PlansStackParamList, "ExercisePicker">;

export default function ExercisePickerScreen({ route, navigation }: Props) {
  const { onAdd, excludeIds } = route.params;
  const exercises = useExerciseStore((s) => s.exercises);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set(excludeIds ?? []));

  const filtered = useMemo(() => {
    const byQuery = searchExercises(exercises, query);
    return group ? byQuery.filter((e) => e.muscleGroup === group) : byQuery;
  }, [exercises, query, group]);

  const handleAdd = (exerciseId: string) => {
    onAdd(exerciseId);
    setAdded((prev) => new Set(prev).add(exerciseId));
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cerca esercizio (anche per nome alternativo)..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <FlatList
        data={["Tutti", ...MUSCLE_GROUPS]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingVertical: 10, gap: 8 }}
        renderItem={({ item }) => {
          const selected = item === "Tutti" ? group === null : group === item;
          return (
            <Pressable
              onPress={() => setGroup(item === "Tutti" ? null : item)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item}</Text>
            </Pressable>
          );
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>Nessun esercizio trovato.</Text>}
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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13 },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
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
