import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ExercisesStackParamList } from "@/navigation/types";
import { useExerciseStore } from "@/store/useExerciseStore";
import ExerciseCard from "@/components/ExerciseCard";
import MuscleGroupFilter from "@/components/MuscleGroupFilter";
import { colors } from "@/theme";
import { searchExercises } from "@/utils/search";

type Props = NativeStackScreenProps<ExercisesStackParamList, "ExercisesList">;

export default function ExercisesScreen({ navigation }: Props) {
  const exercises = useExerciseStore((s) => s.exercises);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const byQuery = searchExercises(exercises, query);
    return group ? byQuery.filter((e) => e.muscleGroup === group) : byQuery;
  }, [exercises, query, group]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cerca esercizio (anche per nome alternativo)..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <MuscleGroupFilter selected={group} onSelect={setGroup} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: item.id })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.empty}>Nessun esercizio trovato.</Text>}
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate("AddExercise", undefined)}>
        <Text style={styles.fabText}>+</Text>
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
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: "#fff", fontSize: 30, lineHeight: 32, marginTop: -2 },
});
