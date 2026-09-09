import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Polygon, Rect } from "react-native-svg";
import { MuscleGroup } from "@/types";

/** Colore distintivo per ogni gruppo muscolare, usato per l'icona e per i badge. */
export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  Petto: "#e0625a",
  Schiena: "#4f8cff",
  Gambe: "#39b872",
  Spalle: "#c77dff",
  Bicipiti: "#f2a541",
  Tricipiti: "#f2ce41",
  Addominali: "#41c9c2",
  Glutei: "#ff6fb0",
  Cardio: "#ff4d6d",
  "Full Body": "#9aa0ac",
};

function Glyph({ group, color }: { group: MuscleGroup; color: string }) {
  const stroke = color;
  const sw = 8;
  switch (group) {
    case "Petto":
      // Bilanciere orizzontale: bar + due dischi
      return (
        <>
          <Rect x="20" y="46" width="60" height="8" rx="4" fill={color} />
          <Circle cx="18" cy="50" r="15" fill={color} />
          <Circle cx="82" cy="50" r="15" fill={color} />
        </>
      );
    case "Schiena":
      // Bilanciere verticale (rematore)
      return (
        <>
          <Rect x="46" y="20" width="8" height="60" rx="4" fill={color} />
          <Circle cx="50" cy="18" r="15" fill={color} />
          <Circle cx="50" cy="82" r="15" fill={color} />
        </>
      );
    case "Gambe":
      // Due gambe
      return (
        <>
          <Rect x="30" y="14" width="16" height="52" rx="8" fill={color} />
          <Rect x="54" y="14" width="16" height="52" rx="8" fill={color} />
          <Rect x="26" y="68" width="24" height="14" rx="6" fill={color} />
          <Rect x="50" y="68" width="24" height="14" rx="6" fill={color} />
        </>
      );
    case "Spalle":
      // Due deltoidi + barra
      return (
        <>
          <Circle cx="28" cy="42" r="19" fill={color} />
          <Circle cx="72" cy="42" r="19" fill={color} />
          <Rect x="30" y="55" width="40" height="10" rx="5" fill={color} />
        </>
      );
    case "Bicipiti":
      // Freccia curva (curl)
      return (
        <>
          <Path d="M28,72 A28,28 0 1,1 72,72" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <Polygon points="72,72 60,68 68,58" fill={color} />
        </>
      );
    case "Tricipiti":
      // Freccia curva opposta (estensione)
      return (
        <>
          <Path d="M72,72 A28,28 0 1,0 28,72" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <Polygon points="28,72 40,68 32,58" fill={color} />
        </>
      );
    case "Addominali":
      // Griglia 2x3 (six-pack)
      return (
        <>
          {[0, 1, 2].map((row) =>
            [0, 1].map((col) => (
              <Rect
                key={`${row}-${col}`}
                x={30 + col * 24}
                y={16 + row * 24}
                width="16"
                height="18"
                rx="5"
                fill={color}
              />
            ))
          )}
        </>
      );
    case "Glutei":
      // Due cerchi sovrapposti
      return (
        <>
          <Circle cx="38" cy="55" r="24" fill={color} />
          <Circle cx="62" cy="55" r="24" fill={color} />
        </>
      );
    case "Cardio":
      // Cuore + battito
      return (
        <>
          <Path
            d="M50,78 C20,58 15,35 32,25 C42,19 50,28 50,35 C50,28 58,19 68,25 C85,35 80,58 50,78 Z"
            fill={color}
          />
        </>
      );
    case "Full Body":
    default:
      // Omino stilizzato
      return (
        <>
          <Circle cx="50" cy="20" r="12" fill={color} />
          <Rect x="46" y="32" width="8" height="30" rx="4" fill={color} />
          <Path d="M50,38 L28,50 M50,38 L72,50" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <Path d="M50,62 L32,86 M50,62 L68,86" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
  }
}

export default function MuscleGroupIcon({
  group,
  size = 56,
  backgroundOpacity = 0.16,
}: {
  group: MuscleGroup;
  size?: number;
  backgroundOpacity?: number;
}) {
  const color = MUSCLE_GROUP_COLORS[group] ?? MUSCLE_GROUP_COLORS["Full Body"];
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size * 0.22, backgroundColor: hexToRgba(color, backgroundOpacity) },
      ]}
    >
      <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 100 100">
        <Glyph group={group} color={color} />
      </Svg>
    </View>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
