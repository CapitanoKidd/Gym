import React, { useLayoutEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HistoryStackParamList } from "@/navigation/types";
import { useHistoryStore } from "@/store/useHistoryStore";
import { colors } from "@/theme";
import { formatDuration } from "@/utils/time";

type Props = NativeStackScreenProps<HistoryStackParamList, "HistoryList">;

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryScreen({ navigation }: Props) {
  const entries = useHistoryStore((s) => s.entries);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Storico",
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("Settings")} style={{ paddingHorizontal: 8 }}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nessun allenamento registrato ancora.{"\n"}Finisci una sessione dalla scheda per vederla qui.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("HistoryDetail", { entryId: item.id })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.planName}</Text>
              <Text style={styles.cardDate}>{formatDate(item.startedAt)}</Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.cardDuration}>{formatDuration(item.durationSeconds)}</Text>
              <Text style={styles.cardExercises}>{item.exercises.length} esercizi</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 60, lineHeight: 22 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  cardDate: { color: colors.textMuted, fontSize: 13, marginTop: 4, textTransform: "capitalize" },
  cardMeta: { alignItems: "flex-end" },
  cardDuration: { color: colors.primary, fontWeight: "700", fontSize: 15 },
  cardExercises: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
});
