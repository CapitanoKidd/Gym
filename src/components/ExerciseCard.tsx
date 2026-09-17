import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Exercise } from "@/types";
import { colors, radius, shadow } from "@/theme";
import ExerciseThumb from "./ExerciseThumb";

export default function ExerciseCard({
  exercise,
  onPress,
  rightAccessory,
}: {
  exercise: Exercise;
  onPress: () => void;
  rightAccessory?: React.ReactNode;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <ExerciseThumb exercise={exercise} size={64} borderRadius={radius.sm} style={styles.thumb} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.group}>{exercise.muscleGroup}</Text>
      </View>
      {rightAccessory}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Niente overflow:hidden qui: clipperebbe anche l'ombra (che deve "uscire" dal
  // bordo per essere visibile) — l'angolo arrotondato del thumb lo gestisce lui stesso.
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    ...shadow.sm,
  },
  thumb: { marginRight: 4 },
  info: { flex: 1, paddingHorizontal: 12 },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  group: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
