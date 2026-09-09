import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlansStackParamList } from "@/navigation/types";
import { usePlanStore } from "@/store/usePlanStore";
import { colors } from "@/theme";

type Props = NativeStackScreenProps<PlansStackParamList, "PlansList">;

export default function PlansScreen({ navigation }: Props) {
  const plans = usePlanStore((s) => s.plans);
  const createPlan = usePlanStore((s) => s.createPlan);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const confirmCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const plan = createPlan(trimmed);
    setNewName("");
    setModalVisible(false);
    navigation.navigate("PlanDetail", { planId: plan.id });
  };

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
      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuova scheda</Text>
            <TextInput
              style={styles.input}
              placeholder="Es. Push Day"
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => {
                  setModalVisible(false);
                  setNewName("");
                }}
              >
                <Text style={styles.modalCancelText}>Annulla</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={confirmCreate}>
                <Text style={styles.modalConfirmText}>Crea</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 18 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: colors.textMuted, fontWeight: "600" },
  modalConfirm: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  modalConfirmText: { color: "#fff", fontWeight: "700" },
});
