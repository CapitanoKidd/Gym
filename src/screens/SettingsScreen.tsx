import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";
import { exportBackup, importBackup } from "@/utils/backup";
import { isWorkoutReminderAvailable } from "@/utils/notifications";

export default function SettingsScreen() {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportBackup();
    } catch (e: any) {
      Alert.alert("Errore export", e?.message ?? "Impossibile esportare il backup.");
    } finally {
      setBusy(false);
    }
  };

  const handleImport = (mode: "merge" | "replace") => {
    const run = async () => {
      setBusy(true);
      try {
        const ok = await importBackup(mode);
        if (ok) Alert.alert("Importazione completata", "I dati sono stati importati.");
      } catch (e: any) {
        Alert.alert("Errore import", e?.message ?? "Il file selezionato non è valido.");
      } finally {
        setBusy(false);
      }
    };

    if (mode === "replace") {
      Alert.alert(
        "Sovrascrivere tutti i dati?",
        "Esercizi, schede e storico attuali verranno sostituiti con quelli del backup.",
        [
          { text: "Annulla", style: "cancel" },
          { text: "Sovrascrivi", style: "destructive", onPress: run },
        ]
      );
    } else {
      run();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.sectionTitle}>Backup dati</Text>
      <Text style={styles.paragraph}>
        Tutti i dati (esercizi, schede e storico allenamenti) vivono solo su questo telefono. Esporta un backup
        di tanto in tanto per non perderli se disinstalli l'app o cambi dispositivo.
      </Text>

      <Pressable style={styles.actionBtn} disabled={busy} onPress={handleExport}>
        <Text style={styles.actionBtnText}>⬆️  Esporta backup (condividi file)</Text>
      </Pressable>

      <Pressable style={styles.actionBtn} disabled={busy} onPress={() => handleImport("merge")}>
        <Text style={styles.actionBtnText}>⬇️  Importa backup (unisci ai dati attuali)</Text>
      </Pressable>

      <Pressable style={[styles.actionBtn, styles.dangerBtn]} disabled={busy} onPress={() => handleImport("replace")}>
        <Text style={[styles.actionBtnText, styles.dangerText]}>⚠️  Importa backup (sovrascrivi tutto)</Text>
      </Pressable>

      {!isWorkoutReminderAvailable() && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ Il promemoria "allenamento in corso" (quando chiudi l'app durante una sessione) è disabilitato:
            Expo Go su Android non supporta più le notifiche da SDK 53. Il resto dell'app funziona normalmente;
            il promemoria tornerà attivo in una build reale (es. con `eas build` o `expo run:android`).
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  paragraph: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  actionBtn: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  actionBtnText: { color: colors.text, fontWeight: "600" },
  dangerBtn: { borderColor: colors.danger },
  dangerText: { color: colors.danger },
  noticeBox: {
    marginTop: 8,
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
});
