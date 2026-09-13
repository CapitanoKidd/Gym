import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { colors } from "@/theme";

export function parseWeightText(text: string): number | undefined {
  const normalized = text.replace(",", ".").trim();
  if (normalized === "") return undefined;
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Campo peso con due pulsanti +/- da mezzo kg accanto al campo di testo. Su alcune
 * tastiere Android il tasto decimale di "decimal-pad" non compare (dipende da
 * produttore/lingua), rendendo impossibile scrivere pesi come 12.5: questi due
 * pulsanti permettono di raggiungere lo stesso valore senza dover per forza digitare
 * il punto/virgola, restando comunque possibile scrivere il peso a mano quando la
 * tastiera lo consente.
 */
export default function WeightInput({
  value,
  onChangeText,
  onFocus,
  style,
  inputStyle,
  highlighted,
  compact,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  highlighted?: boolean;
  compact?: boolean;
}) {
  const step = (delta: number) => {
    const current = parseWeightText(value) ?? 0;
    const next = Math.max(0, Math.round((current + delta) * 10) / 10);
    onChangeText(String(next));
  };

  return (
    <View style={[styles.wrap, style]}>
      <Pressable onPress={() => step(-0.5)} style={[styles.stepBtn, compact && styles.stepBtnCompact]} hitSlop={6}>
        <Text style={styles.stepBtnText}>–</Text>
      </Pressable>
      <TextInput
        style={[styles.input, compact && styles.inputCompact, highlighted && styles.inputHighlighted, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        keyboardType="decimal-pad"
        placeholder="peso"
        placeholderTextColor={colors.textMuted}
      />
      <Pressable onPress={() => step(0.5)} style={[styles.stepBtn, compact && styles.stepBtnCompact]} hitSlop={6}>
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnCompact: { width: 22, height: 22, borderRadius: 11 },
  stepBtnText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 64,
    textAlign: "center",
  },
  inputCompact: { minWidth: 40, fontSize: 12, fontWeight: "600", paddingVertical: 6, paddingHorizontal: 4 },
  inputHighlighted: { borderColor: colors.success, borderWidth: 2 },
});
