import React from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useExerciseStore } from "@/store/useExerciseStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { colors } from "@/theme";
import LineChart, { ChartPoint } from "@/components/LineChart";

type Props = {
  route: { params: { exerciseId: string } };
};

export default function ExerciseProgressScreen({ route }: Props) {
  const { exerciseId } = route.params;
  const exercise = useExerciseStore((s) => s.getById(exerciseId));
  const weightHistory = useHistoryStore((s) => s.getWeightHistoryForExercise(exerciseId));
  const { width } = useWindowDimensions();

  const points: ChartPoint[] = weightHistory.map((p) => ({
    x: p.date,
    y: p.weight,
    label: new Date(p.date).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }),
  }));

  const first = points[0];
  const last = points[points.length - 1];
  const delta = first && last ? Math.round((last.y - first.y) * 10) / 10 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.title}>{exercise?.name ?? "Esercizio"}</Text>
      <Text style={styles.subtitle}>Progressione del peso nel tempo</Text>

      {points.length < 2 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            {points.length === 0
              ? "Non hai ancora registrato un peso per questo esercizio durante un allenamento.\n\nDurante una sessione, apri \"📝 Nota / peso\" sull'esercizio e inserisci il peso usato: comparirà qui."
              : "Serve almeno un secondo allenamento con un peso registrato per questo esercizio per tracciare una linea di progressione."}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <LineChart points={points} width={width - 40 - 32} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Primo registrato</Text>
              <Text style={styles.statValue}>{first.y} kg</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ultimo registrato</Text>
              <Text style={styles.statValue}>{last.y} kg</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Variazione</Text>
              <Text style={[styles.statValue, { color: delta >= 0 ? colors.success : colors.danger }]}>
                {delta >= 0 ? "+" : ""}
                {delta} kg
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: 18 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyText: { color: colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  statLabel: { color: colors.textMuted, fontSize: 11, textAlign: "center" },
  statValue: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 4 },
});
