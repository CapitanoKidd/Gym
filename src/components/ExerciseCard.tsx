import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Exercise } from "@/types";
import { colors } from "@/theme";
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
      <ExerciseThumb exercise={exercise} size={72} />
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: { flex: 1, paddingHorizontal: 12 },
  name: { color: colors.text, fontSize: 16, fontWeight: "600" },
  group: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
