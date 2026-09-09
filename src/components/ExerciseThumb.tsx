import React from "react";
import { Image, ImageStyle, StyleProp, View, ViewStyle } from "react-native";
import { Exercise } from "@/types";
import MuscleGroupIcon from "./MuscleGroupIcon";

/**
 * Mostra la foto dell'esercizio se ne è stata impostata una (tipicamente per esercizi
 * custom), altrimenti un'icona per gruppo muscolare — niente più immagini casuali di
 * segnaposto, e funziona anche senza connessione.
 */
export default function ExerciseThumb({
  exercise,
  size = 56,
  style,
  borderRadius,
}: {
  exercise: Exercise;
  size?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}) {
  if (exercise.imageUrl) {
    return (
      <Image
        source={{ uri: exercise.imageUrl }}
        style={[{ width: size, height: size, borderRadius: borderRadius ?? 0 }, style as StyleProp<ImageStyle>]}
      />
    );
  }
  return (
    <View style={style}>
      <MuscleGroupIcon group={exercise.muscleGroup} size={size} />
    </View>
  );
}
