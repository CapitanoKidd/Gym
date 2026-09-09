import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { useExerciseStore } from "@/store/useExerciseStore";
import { usePickerResultStore } from "@/store/usePickerResultStore";
import ExerciseCard from "@/components/ExerciseCard";
import MuscleGroupFilter from "@/components/MuscleGroupFilter";
import { colors } from "@/theme";
import { searchExercises } from "@/utils/search";

type Props = NativeStackScreenProps<PlansStackParamList, "ExercisePicker">;

export default function ExercisePickerScreen({ route, navigation }: Props) {
  const { excludeIds } = route.params;
  const exercises = useExerciseStore((s) => s.exercises);
  const pickInStore = usePickerResultStore((s) => s.pick);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const byQuery = searchExercises(exercises, query);
    return group ? byQuery.filter((e) => e.muscleGroup === group) : byQuery;
  }, [exercises, query, group]);

  const alreadyInPlan = new Set(excludeIds ?? []);

  // Sceglie l'esercizio e torna subito alla scheda in modifica: per aggiungerne un altro
  // si tocca di nuovo "Aggiungi esercizi" da lì. Un semplice goBack() (invece di navigate
  // verso lo schermo esistente) evita in modo affidabile di impilarne un'altra copia.
  const pick = (exerciseId: string) => {
    pickInStore(exerciseId);
    navigation.goBack();
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
      <MuscleGroupFilter selected={group} onSelect={setGroup} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>Nessun esercizio trovato.</Text>}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => pick(item.id)}
            rightAccessory={
              <Pressable style={styles.addBtn} onPress={() => pick(item.id)}>
                <Text style={styles.addBtnText}>{alreadyInPlan.has(item.id) ? "+ Aggiungi di nuovo" : "+ Aggiungi"}</Text>
              </Pressable>
            }
          />
        )}
      />
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
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
