import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { colors } from "@/theme";

type Props = NativeStackScreenProps<PlansStackParamList, "PlansList">;

export default function PlansScreen({ navigation }: Props) {
  const plans = usePlanStore((s) => s.plans);

  return (
    <View style={styles.container}>
      <FlatList
        data={[...plans].sort((a, b) => b.createdAt - a.createdAt)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nessuna scheda ancora.{"\n"}Premi + per crearne una.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("PlanDetail", { planId: item.id })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.exercises.length} esercizi</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate("PlanEditor", {})}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 60, lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
  cardSubtitle: { color: colors.textMuted, marginTop: 4 },
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
  },
  fabText: { color: "#fff", fontSize: 30, lineHeight: 32, marginTop: -2 },
});
