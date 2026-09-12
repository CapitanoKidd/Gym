import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HistoryStackParamList } from "@/navigation/types";
import { useHistoryStore } from "@/store/useHistoryStore";
import { colors } from "@/theme";
import { formatDuration } from "@/utils/time";

type Props = NativeStackScreenProps<HistoryStackParamList, "HistoryDetail">;

export default function HistoryDetailScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const entry = useHistoryStore((s) => s.entries.find((e) => e.id === entryId));
  const deleteEntry = useHistoryStore((s) => s.deleteEntry);

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Sessione non trovata.</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert("Elimina sessione", "Vuoi rimuovere questa sessione dallo storico?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          deleteEntry(entry.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.title}>{entry.planName}</Text>
      <Text style={styles.subtitle}>
        {new Date(entry.startedAt).toLocaleString("it-IT")} · durata {formatDuration(entry.durationSeconds)}
      </Text>

      {entry.exercises.map((ex, i) => (
        <View key={i} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
          <Text style={styles.exerciseMeta}>
            {ex.sets} serie × {ex.reps} rip.{ex.weight ? `  ·  ${ex.weight} kg` : ""}
          </Text>
          {ex.setWeights && ex.setWeights.some((w) => w != null) && (
            <View style={styles.setWeightsRow}>
              {ex.setWeights.map((w, si) => (
                <View key={si} style={styles.setWeightChip}>
                  <Text style={styles.setWeightChipText}>{w != null ? `${w} kg` : "–"}</Text>
                </View>
              ))}
            </View>
          )}
          {!!ex.note && (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>📝 {ex.note}</Text>
            </View>
          )}
        </View>
      ))}

      <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
        <Text style={styles.deleteBtnText}>Elimina sessione dallo storico</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 60 },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 6, marginBottom: 20, textTransform: "capitalize" },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  exerciseMeta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  setWeightsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  setWeightChip: { backgroundColor: colors.cardAlt, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  setWeightChipText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  noteBox: { marginTop: 8, backgroundColor: colors.cardAlt, borderRadius: 8, padding: 10 },
  noteText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  deleteBtn: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteBtnText: { color: colors.danger, fontWeight: "600" },
});
