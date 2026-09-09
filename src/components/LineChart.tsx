import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme";

export interface ChartPoint {
  x: number; // timestamp
  y: number; // valore (es. kg)
  label: string; // etichetta breve per l'asse x (es. "12 set")
}

const PADDING_LEFT = 40;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 30;

/**
 * Semplice grafico a linee "fatto in casa" con react-native-svg: un piano cartesiano
 * con asse X (tempo) e asse Y (valore), punti collegati da segmenti. Niente librerie
 * di charting pesanti: per pochi punti (progressione dei pesi di un esercizio) basta
 * disegnare a mano linee, cerchi e testo su un <Svg>.
 */
export default function LineChart({
  points,
  width,
  height = 220,
  unit = "kg",
}: {
  points: ChartPoint[];
  width: number;
  height?: number;
  unit?: string;
}) {
  if (points.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>Nessun dato ancora.</Text>
      </View>
    );
  }

  const values = points.map((p) => p.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  // Se tutti i punti hanno lo stesso valore, crea comunque un range visibile
  const yRange = maxY - minY || Math.max(2, maxY * 0.1 || 2);
  const yMin = minY - yRange * 0.15;
  const yMax = maxY + yRange * 0.15;

  const chartW = width - PADDING_LEFT - PADDING_RIGHT;
  const chartH = height - PADDING_TOP - PADDING_BOTTOM;

  const xForIndex = (i: number) =>
    points.length === 1
      ? PADDING_LEFT + chartW / 2
      : PADDING_LEFT + (chartW * i) / (points.length - 1);
  const yForValue = (v: number) => PADDING_TOP + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xForIndex(i)} ${yForValue(p.y)}`)
    .join(" ");

  // 3 linee guida orizzontali (min, metà, max)
  const gridValues = [yMin + (yMax - yMin) * 0.02, (yMin + yMax) / 2, yMax - (yMax - yMin) * 0.02];

  // Mostra al massimo ~5 etichette sull'asse x per non sovrapporle
  const labelStep = Math.max(1, Math.ceil(points.length / 5));

  return (
    <View>
      <Svg width={width} height={height}>
        {gridValues.map((gv, i) => (
          <Line
            key={i}
            x1={PADDING_LEFT}
            x2={width - PADDING_RIGHT}
            y1={yForValue(gv)}
            y2={yForValue(gv)}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {gridValues.map((gv, i) => (
          <SvgText key={`label-${i}`} x={4} y={yForValue(gv) + 4} fontSize={11} fill={colors.textMuted}>
            {Math.round(gv * 10) / 10}
          </SvgText>
        ))}

        <Path d={linePath} stroke={colors.primary} strokeWidth={2.5} fill="none" />

        {points.map((p, i) => (
          <Circle key={i} cx={xForIndex(i)} cy={yForValue(p.y)} r={4.5} fill={colors.primary} />
        ))}

        {points.map((p, i) =>
          i % labelStep === 0 || i === points.length - 1 ? (
            <SvgText
              key={`x-${i}`}
              x={xForIndex(i)}
              y={height - 8}
              fontSize={10}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          ) : null
        )}
      </Svg>
      <Text style={styles.unitHint}>Valori in {unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.textMuted },
  unitHint: { color: colors.textMuted, fontSize: 11, textAlign: "right", marginTop: 2 },
});
