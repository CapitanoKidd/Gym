import React from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ExercisesStackParamList } from "@/navigation/types";
import { useExerciseStore } from "@/store/useExerciseStore";
import { usePlanStore } from "@/store/usePlanStore";
import { colors } from "@/theme";
import MuscleGroupIcon, { MUSCLE_GROUP_COLORS } from "@/components/MuscleGroupIcon";

type Props = NativeStackScreenProps<ExercisesStackParamList, "ExerciseDetail">;

export default function ExerciseDetailScreen({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const exercise = useExerciseStore((s) => s.getById(exerciseId));
  const deleteExercise = useExerciseStore((s) => s.deleteExercise);
  const plans = usePlanStore((s) => s.plans);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Esercizio non trovato</Text>
      </View>
    );
  }

  const plansUsingIt = plans.filter((p) => p.exercises.some((e) => e.exerciseId === exercise.id));

  const confirmDelete = () => {
    const usageWarning =
      plansUsingIt.length > 0
        ? `\n\nÈ usato in ${plansUsingIt.length} scheda${plansUsingIt.length > 1 ? "e" : ""} (${plansUsingIt
            .map((p) => p.name)
            .join(", ")}): in quelle schede l'esercizio risulterà "eliminato" e andrà rimosso a mano.`
        : "";
    Alert.alert("Elimina esercizio", `Vuoi eliminare "${exercise.name}"?${usageWarning}`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          deleteExercise(exercise.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {exercise.imageUrl ? (
        <Image source={{ uri: exercise.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.iconHeader, { backgroundColor: MUSCLE_GROUP_COLORS[exercise.muscleGroup] + "22" }]}>
          <MuscleGroupIcon group={exercise.muscleGroup} size={120} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{exercise.muscleGroup}</Text>
        </View>

        <Text style={styles.sectionTitle}>Come si esegue</Text>
        <Text style={styles.paragraph}>{exercise.description}</Text>

        <Text style={styles.sectionTitle}>✅ Cosa fare</Text>
        {exercise.doList.map((d, i) => (
          <Text key={i} style={styles.listItem}>
            •  {d}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>❌ Cosa non fare</Text>
        {exercise.dontList.map((d, i) => (
          <Text key={i} style={styles.listItem}>
            •  {d}
          </Text>
        ))}

        <Pressable
          style={styles.progressBtn}
          onPress={() => navigation.navigate("ExerciseProgress", { exerciseId: exercise.id })}
        >
          <Text style={styles.progressBtnText}>📈 Vedi progressione peso</Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            style={styles.editBtn}
            onPress={() => navigation.navigate("AddExercise", { exerciseId: exercise.id })}
          >
            <Text style={styles.editBtnText}>Modifica</Text>
          </Pressable>
          {exercise.isCustom && (
            <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
              <Text style={styles.deleteBtnText}>Elimina</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  image: { width: "100%", height: 220 },
  iconHeader: { alignItems: "center", justifyContent: "center" },
  body: { padding: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 16,
  },
  badgeText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 18, marginBottom: 6 },
  paragraph: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  listItem: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  progressBtn: {
    marginTop: 24,
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressBtnText: { color: colors.primary, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12, marginTop: 14 },
  editBtn: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: { color: colors.text, fontWeight: "600" },
  deleteBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteBtnText: { color: colors.danger, fontWeight: "600" },
});
