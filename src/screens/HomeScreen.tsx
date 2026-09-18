import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { colors, radius, shadow } from "@/theme";

type Props = NativeStackScreenProps<HomeStackParamList, "HomeMain">;

function greetingForHour(hour: number): string {
  if (hour < 6) return "Ancora sveglio";
  if (hour < 12) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function timeAgo(ts: number): string {
  // Confronto per giorno di calendario, non per ore trascorse: un allenamento fatto ieri
  // alle 22 e "oggi" alle 7 del mattino sono passate solo 9 ore, ma sono comunque due
  // giorni di calendario diversi — altrimenti risulterebbe "oggi" per errore.
  const diffDays = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86400000);
  if (diffDays <= 0) {
    const diffHours = Math.floor((Date.now() - ts) / 3600000);
    return diffHours < 1 ? "poco fa" : "oggi";
  }
  if (diffDays === 1) return "ieri";
  if (diffDays < 7) return `${diffDays} giorni fa`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "una settimana fa";
  if (diffDays < 30) return `${diffWeeks} settimane fa`;
  return new Date(ts).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

/** Lunedì (00:00) della settimana corrente, per contare gli allenamenti "di questa settimana". */
function startOfWeek(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = domenica
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const plans = usePlanStore((s) => s.plans);
  const entries = useHistoryStore((s) => s.entries);
  const activeSession = useSessionStore((s) => s.active);
  const { name, weeklyGoal, setWeeklyGoal } = useProfileStore();

  const activePlan = activeSession ? plans.find((p) => p.id === activeSession.planId) : undefined;
  const lastWorkout = entries[0]; // già ordinato dal più recente
  const weekStart = startOfWeek();
  const workoutsThisWeek = entries.filter((e) => e.startedAt >= weekStart).length;
  const goalReached = workoutsThisWeek >= weeklyGoal;
  const recentPlans = [...plans].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);

  // Naviga in un'altra tab (Schede) mantenendo lo stack di quella tab: le route di
  // destinazione (PlanDetail, PlanEditor) vivono lì, non in questo stack Home.
  const goToPlans = (screen: string, params?: object) => {
    (navigation as any).getParent()?.navigate("Schede", { screen, params });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: 40 }}>
      <Text style={styles.greeting}>
        {greeting}
        {name ? `, ${name}` : ""} 👋
      </Text>
      <Text style={styles.subGreeting}>È ora di allenarti 💪</Text>

      {activePlan && (
        <Pressable
          style={styles.resumeBanner}
          onPress={() => goToPlans("WorkoutSession", { planId: activePlan.id })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeBannerTitle}>💪 Allenamento in corso</Text>
            <Text style={styles.resumeBannerSubtitle}>{activePlan.name}</Text>
          </View>
          <Text style={styles.resumeBannerAction}>Riprendi →</Text>
        </Pressable>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Ultimo allenamento</Text>
          <Text style={styles.statValue}>{lastWorkout ? timeAgo(lastWorkout.startedAt) : "Mai"}</Text>
          {lastWorkout && <Text style={styles.statHint} numberOfLines={1}>{lastWorkout.planName}</Text>}
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Questa settimana</Text>
          <Text style={[styles.statValue, goalReached && styles.statValueGood]}>
            {workoutsThisWeek} / {weeklyGoal}
          </Text>
          <View style={styles.goalAdjustRow}>
            <Pressable
              style={styles.goalAdjustBtn}
              onPress={() => setWeeklyGoal(weeklyGoal - 1)}
              hitSlop={6}
            >
              <Text style={styles.goalAdjustBtnText}>–</Text>
            </Pressable>
            <Text style={styles.goalAdjustLabel}>obiettivo</Text>
            <Pressable
              style={styles.goalAdjustBtn}
              onPress={() => setWeeklyGoal(weeklyGoal + 1)}
              hitSlop={6}
            >
              <Text style={styles.goalAdjustBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Le tue schede</Text>
        <Pressable onPress={() => goToPlans("PlansList")}>
          <Text style={styles.sectionLink}>Vedi tutte →</Text>
        </Pressable>
      </View>

      {recentPlans.length === 0 ? (
        <Pressable style={styles.emptyPlansCard} onPress={() => goToPlans("PlanEditor")}>
          <Text style={styles.emptyPlansIcon}>🏋️</Text>
          <Text style={styles.emptyPlansTitle}>Ancora nessuna scheda</Text>
          <Text style={styles.emptyPlansText}>Tocca per crearne una e iniziare ad allenarti.</Text>
        </Pressable>
      ) : (
        <>
          {recentPlans.map((p) => (
            <Pressable key={p.id} style={styles.planCard} onPress={() => goToPlans("PlanDetail", { planId: p.id })}>
              <View style={styles.planCardIcon}>
                <Text style={styles.planCardIconText}>📋</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planCardTitle}>{p.name}</Text>
                <Text style={styles.planCardSubtitle}>
                  {p.exercises.length} esercizio{p.exercises.length === 1 ? "" : "i"}
                </Text>
              </View>
              <Text style={styles.planCardChevron}>›</Text>
            </Pressable>
          ))}
          <Pressable style={styles.newPlanBtn} onPress={() => goToPlans("PlanEditor")}>
            <Text style={styles.newPlanBtnText}>+  Nuova scheda</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  greeting: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 8 },
  subGreeting: { color: colors.textMuted, fontSize: 15, marginTop: 4 },
  resumeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 20,
    ...shadow.sm,
  },
  resumeBannerTitle: { color: colors.success, fontWeight: "700", fontSize: 15 },
  resumeBannerSubtitle: { color: colors.text, fontSize: 13, marginTop: 2 },
  resumeBannerAction: { color: colors.success, fontWeight: "700", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 22 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow.sm,
  },
  statLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  statValue: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 6 },
  statValueGood: { color: colors.success },
  statHint: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  goalAdjustRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  goalAdjustBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalAdjustBtnText: { color: colors.text, fontWeight: "700", fontSize: 13 },
  goalAdjustLabel: { color: colors.textMuted, fontSize: 11 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sectionLink: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  emptyPlansCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
  },
  emptyPlansIcon: { fontSize: 32, marginBottom: 8 },
  emptyPlansTitle: { color: colors.text, fontWeight: "700", fontSize: 15 },
  emptyPlansText: { color: colors.textMuted, fontSize: 13, marginTop: 4, textAlign: "center" },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  planCardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planCardIconText: { fontSize: 20 },
  planCardTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  planCardSubtitle: { color: colors.textMuted, marginTop: 2, fontSize: 12 },
  planCardChevron: { color: colors.textMuted, fontSize: 24, fontWeight: "300", marginLeft: 6 },
  newPlanBtn: {
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
  },
  newPlanBtnText: { color: colors.text, fontWeight: "700" },
});
