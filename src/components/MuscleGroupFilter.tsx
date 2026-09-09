import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { MUSCLE_GROUPS } from "@/store/useExerciseStore";
import { colors } from "@/theme";

/**
 * Riga di chip per filtrare per gruppo muscolare. Usa una ScrollView semplice invece di
 * una FlatList orizzontale: con una manciata di elementi statici come questi, la FlatList
 * introduce un problema noto di misurazione dell'altezza (i chip nascono troppo bassi e poi
 * "esplodono" alla prima ri-renderizzazione, es. quando si apre la tastiera) — la ScrollView
 * non ha questo problema perché non prova a virtualizzare/misurare il contenuto.
 */
export default function MuscleGroupFilter({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (group: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.rowContent}
    >
      {["Tutti", ...MUSCLE_GROUPS].map((item) => {
        const isSelected = item === "Tutti" ? selected === null : selected === item;
        return (
          <Pressable
            key={item}
            onPress={() => onSelect(item === "Tutti" ? null : item)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]} numberOfLines={1}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const CHIP_HEIGHT = 36;

const styles = StyleSheet.create({
  // flexShrink: 0 è la parte che conta qui: senza, un fratello che cresce (la lista sotto,
  // FlatList è flex:1 di default) fa restringere questa riga sotto la sua altezza fissa,
  // anche se ha un "height" esplicito — un height fisso da solo non basta a impedire lo
  // shrink in un flex container.
  row: { height: CHIP_HEIGHT + 20, flexGrow: 0, flexShrink: 0 },
  rowContent: { paddingVertical: 10, gap: 8, alignItems: "center" },
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 14,
    borderRadius: CHIP_HEIGHT / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, lineHeight: 16 },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
});
