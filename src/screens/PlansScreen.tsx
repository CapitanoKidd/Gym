import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { useSessionStore } from "@/store/useSessionStore";
import { colors, radius, shadow } from "@/theme";

type Props = NativeStackScreenProps<PlansStackParamList, "PlansList">;

export default function PlansScreen({ navigation }: Props) {
  const plans = usePlanStore((s) => s.plans);
  const activeSession = useSessionStore((s) => s.active);
  // Se si esce dalla schermata di allenamento (es. cambiando scheda tramite il tab, che
  // di default riporta qui alla radice dello stack) la sessione resta comunque salvata:
  // questo banner è il modo per rientrarci senza doverla ricominciare.
  const activePlan = activeSession ? plans.find((p) => p.id === activeSession.planId) : undefined;
  const sortedPlans = [...plans].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Le tue schede</Text>
          <Text style={styles.headerSubtitle}>
            {plans.length === 0 ? "Nessuna scheda ancora" : `${plans.length} scheda${plans.length > 1 ? "e" : ""}`}
          </Text>
        </View>
        <Pressable style={styles.newBtn} onPress={() => navigation.navigate("PlanEditor", {})} hitSlop={8}>
          <Text style={styles.newBtnText}>+  Nuova</Text>
        </Pressable>
      </View>

      {activePlan && (
        <Pressable
          style={styles.resumeBanner}
          onPress={() => navigation.navigate("WorkoutSession", { planId: activePlan.id })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeBannerTitle}>💪 Allenamento in corso</Text>
            <Text style={styles.resumeBannerSubtitle}>{activePlan.name}</Text>
          </View>
          <Text style={styles.resumeBannerAction}>Riprendi →</Text>
        </Pressable>
      )}

      <FlatList
        data={sortedPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>Ancora nessuna scheda</Text>
            <Text style={styles.empty}>Crea la tua prima scheda di allenamento per iniziare.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate("PlanEditor", {})}>
              <Text style={styles.emptyBtnText}>+  Crea la prima scheda</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("PlanDetail", { planId: item.id })}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                {item.exercises.length} esercizio{item.exercises.length === 1 ? "" : "i"}
              </Text>
            </View>
            <Text style={styles.cardChevron}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerTitle: { color: colors.text, fontSize: 26, fontWeight: "800" },
  headerSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadow.sm,
  },
  newBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  empty: { color: colors.textMuted, textAlign: "center", lineHeight: 21, marginTop: 6 },
  emptyState: { alignItems: "center", paddingTop: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 13,
    ...shadow.sm,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  resumeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 4,
    ...shadow.sm,
  },
  resumeBannerTitle: { color: colors.success, fontWeight: "700", fontSize: 15 },
  resumeBannerSubtitle: { color: colors.text, fontSize: 13, marginTop: 2 },
  resumeBannerAction: { color: colors.success, fontWeight: "700", fontSize: 13 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardIconText: { fontSize: 22 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: colors.textMuted, marginTop: 3, fontSize: 13 },
  cardChevron: { color: colors.textMuted, fontSize: 26, fontWeight: "300", marginLeft: 6 },
});
