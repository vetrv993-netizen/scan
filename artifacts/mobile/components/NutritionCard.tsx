import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { NutritionBar } from "./NutritionBar";
import type { NutritionData } from "@/types/nutrition";
import { useApp } from "@/context/AppContext";

interface NutritionCardProps {
  data: NutritionData;
}

function SectionHeader({
  title,
  isRTL,
  colors,
}: {
  title: string;
  isRTL: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
      ]}
    >
      {title}
    </Text>
  );
}

function MineralBadge({
  label,
  value,
  unit,
  colors,
  isRTL,
}: {
  label: string;
  value: number;
  unit: string;
  colors: ReturnType<typeof useColors>;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.mineralBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <Text style={[styles.mineralValue, { color: colors.foreground }]}>
        {value % 1 === 0 ? value : value.toFixed(1)}
      </Text>
      <Text style={[styles.mineralUnit, { color: colors.mutedForeground }]}>{unit}</Text>
      <Text style={[styles.mineralLabel, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
        {label}
      </Text>
    </View>
  );
}

const MACRO_COLORS = {
  protein: "#3B82F6",
  fat: "#F59E0B",
  carbohydrates: "#A855F7",
  fiber: "#22C55E",
  sugar: "#EF4444",
};

export function NutritionCard({ data }: NutritionCardProps) {
  const colors = useColors();
  const { t, isRTL } = useApp();

  const scoreColor =
    data.healthScore >= 75 ? colors.scoreHigh
      : data.healthScore >= 50 ? colors.scoreMid
      : colors.scoreLow;

  const scoreLabel =
    data.healthScore >= 75 ? t.result.scoreExcellent
      : data.healthScore >= 50 ? t.result.scoreGood
      : data.healthScore >= 30 ? t.result.scoreFair
      : t.result.scorePoor;

  return (
    <View style={styles.wrapper}>
      {/* Header: name + score */}
      <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={styles.foodInfo}>
          <Text
            style={[styles.foodName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
          >
            {isRTL ? data.foodName.ar : data.foodName.en}
          </Text>
          <Text style={[styles.serving, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
            {t.result.servingSize}: {data.servingSize}
          </Text>
        </View>
        <View style={[styles.scoreCircle, { borderColor: scoreColor, backgroundColor: scoreColor + "14" }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>{Math.round(data.healthScore)}</Text>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
        </View>
      </View>

      {/* Calories */}
      <View style={[styles.calorieBox, { backgroundColor: colors.secondary }]}>
        <Feather name="zap" size={20} color={colors.accent} />
        <Text style={[styles.calorieNum, { color: colors.accent }]}>{Math.round(data.calories)}</Text>
        <Text style={[styles.calorieUnit, { color: colors.mutedForeground }]}>{t.result.kcal}</Text>
      </View>

      {/* AI Analysis label (no provider name) */}
      <View style={[styles.aiRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Feather name="cpu" size={12} color={colors.mutedForeground} />
        <Text style={[styles.aiLabel, { color: colors.mutedForeground }]}>{t.result.aiAnalysis}</Text>
      </View>

      {/* Macros */}
      <SectionHeader title={t.result.macros} isRTL={isRTL} colors={colors} />
      <NutritionBar label={t.result.protein} value={data.macros.protein} unit={t.result.g} maxValue={50} color={MACRO_COLORS.protein} isRTL={isRTL} />
      <NutritionBar label={t.result.fat} value={data.macros.fat} unit={t.result.g} maxValue={70} color={MACRO_COLORS.fat} isRTL={isRTL} />
      <NutritionBar label={t.result.carbs} value={data.macros.carbohydrates} unit={t.result.g} maxValue={100} color={MACRO_COLORS.carbohydrates} isRTL={isRTL} />
      <NutritionBar label={t.result.fiber} value={data.macros.fiber} unit={t.result.g} maxValue={30} color={MACRO_COLORS.fiber} isRTL={isRTL} />
      <NutritionBar label={t.result.sugar} value={data.macros.sugar} unit={t.result.g} maxValue={50} color={MACRO_COLORS.sugar} isRTL={isRTL} />

      {/* Minerals */}
      <SectionHeader title={t.result.minerals} isRTL={isRTL} colors={colors} />
      <View style={[styles.mineralRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <MineralBadge label={t.result.sodium} value={data.minerals.sodium} unit={t.result.mg} colors={colors} isRTL={isRTL} />
        <MineralBadge label={t.result.calcium} value={data.minerals.calcium} unit={t.result.mg} colors={colors} isRTL={isRTL} />
        <MineralBadge label={t.result.iron} value={data.minerals.iron} unit={t.result.mg} colors={colors} isRTL={isRTL} />
      </View>

      {/* Vitamins */}
      <SectionHeader title={t.result.vitamins} isRTL={isRTL} colors={colors} />
      {data.vitamins.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vitaminScroll}>
          {data.vitamins.map((v, i) => (
            <View key={i} style={[styles.vitaminBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.vitaminText, { color: colors.primary }]}>{v}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.noData, { color: colors.mutedForeground }]}>{t.result.noVitamins}</Text>
      )}

      {/* Estimated badge */}
      {(data.isEstimated || data.imageQuality !== "clear") && (
        <View style={[styles.estimatedBadge, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "50" }]}>
          <Feather name="info" size={14} color={colors.warning} />
          <Text style={[styles.estimatedText, { color: colors.warning }]}>{t.result.estimated}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 4 },
  headerRow: { alignItems: "flex-start", marginBottom: 16, gap: 12 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4, lineHeight: 28 },
  serving: { fontSize: 13, fontFamily: "Inter_400Regular" },
  scoreCircle: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 2.5,
    alignItems: "center", justifyContent: "center",
  },
  scoreNumber: { fontSize: 20, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  calorieBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 14, paddingVertical: 14, marginBottom: 8, gap: 6,
  },
  calorieNum: { fontSize: 34, fontFamily: "Inter_700Bold" },
  calorieUnit: { fontSize: 16, fontFamily: "Inter_400Regular", alignSelf: "flex-end", marginBottom: 4 },
  aiRow: { alignItems: "center", gap: 5, marginBottom: 18 },
  aiLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12, marginTop: 4 },
  mineralRow: { gap: 8, marginBottom: 16 },
  mineralBadge: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: "center",
    borderWidth: 1,
  },
  mineralValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  mineralUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  mineralLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  vitaminScroll: { marginBottom: 16 },
  vitaminBadge: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    marginRight: 8, borderWidth: 1,
  },
  vitaminText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  noData: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  estimatedBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, marginBottom: 12, alignSelf: "flex-start",
  },
  estimatedText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
