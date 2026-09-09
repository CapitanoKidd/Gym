import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ExercisesStackParamList } from "@/navigation/types";
import { useExerciseStore, MUSCLE_GROUPS } from "@/store/useExerciseStore";
import { MuscleGroup } from "@/types";
import { colors } from "@/theme";

type Props = NativeStackScreenProps<ExercisesStackParamList, "AddExercise">;

export default function AddExerciseScreen({ route, navigation }: Props) {
  const exerciseId = route.params?.exerciseId;
  const existing = useExerciseStore((s) => (exerciseId ? s.getById(exerciseId) : undefined));
  const addExercise = useExerciseStore((s) => s.addExercise);
  const updateExercise = useExerciseStore((s) => s.updateExercise);

  const [name, setName] = useState(existing?.name ?? "");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(existing?.muscleGroup ?? "Petto");
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [doText, setDoText] = useState(existing?.doList.join("\n") ?? "");
  const [dontText, setDontText] = useState(existing?.dontList.join("\n") ?? "");
  const [aliasText, setAliasText] = useState(existing?.aliases.join(", ") ?? "");

  const canSave = name.trim().length > 0;

  const save = () => {
    const payload = {
      name: name.trim(),
      muscleGroup,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim(),
      doList: doText.split("\n").map((s) => s.trim()).filter(Boolean),
      dontList: dontText.split("\n").map((s) => s.trim()).filter(Boolean),
      aliases: aliasText.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (existing) {
      updateExercise(existing.id, payload);
    } else {
      addExercise(payload);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.label}>Nome esercizio</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Es. Squat" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Gruppo muscolare</Text>
      <View style={styles.wrap}>
        {MUSCLE_GROUPS.map((g) => (
          <Pressable
            key={g}
            onPress={() => setMuscleGroup(g)}
            style={[styles.chip, muscleGroup === g && styles.chipSelected]}
          >
            <Text style={[styles.chipText, muscleGroup === g && styles.chipTextSelected]}>{g}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>URL immagine di anteprima (opzionale)</Text>
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />
      <Text style={styles.hint}>
        Se non la imposti, l'esercizio mostra un'icona colorata in base al gruppo muscolare.
      </Text>

      <Text style={styles.label}>Altri nomi / alias (separati da virgola)</Text>
      <TextInput
        style={styles.input}
        value={aliasText}
        onChangeText={setAliasText}
        placeholder="Es. push up, piegamenti"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.hint}>
        Usati dalla ricerca intelligente: se cerchi "push up" e questo esercizio si chiama
        "Flessioni", aggiungendo l'alias lo troverai comunque.
      </Text>

      <Text style={styles.label}>Descrizione / come si esegue</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Spiega l'esecuzione del movimento"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Cosa fare (una riga per punto)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={doText}
        onChangeText={setDoText}
        multiline
        placeholder={"Es.\nSchiena dritta\nControlla il movimento"}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Cosa non fare (una riga per punto)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={dontText}
        onChangeText={setDontText}
        multiline
        placeholder={"Es.\nNon inarcare la schiena"}
        placeholderTextColor={colors.textMuted}
      />

      <Pressable style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} disabled={!canSave} onPress={save}>
        <Text style={styles.saveBtnText}>{existing ? "Salva modifiche" : "Aggiungi esercizio"}</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { color: colors.text, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 6, lineHeight: 17 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13 },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
