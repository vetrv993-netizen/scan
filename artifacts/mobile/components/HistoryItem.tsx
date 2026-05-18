import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { StoredAnalysis } from "@/types/nutrition";

interface HistoryItemProps {
  analysis: StoredAnalysis;
  onPress: () => void;
  onDelete: () => void;
}

export function HistoryItem({ analysis, onPress, onDelete }: HistoryItemProps) {
  const colors = useColors();
  const { language, isRTL } = useApp();

  const foodName =
    language === "ar"
      ? analysis.nutritionData.foodName.ar
      : analysis.nutritionData.foodName.en;

  const date = new Date(analysis.createdAt);
  const dateStr = date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const score = Math.round(analysis.nutritionData.healthScore);
  const scoreColor =
    score >= 75 ? colors.scoreHigh : score >= 50 ? colors.scoreMid : colors.scoreLow;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={[styles.inner, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {/* Score indicator */}
        <View style={[styles.scoreDot, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>

        {/* Info */}
        <View style={[styles.info, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
          <Text
            style={[
              styles.foodName,
              { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
            ]}
            numberOfLines={1}
          >
            {foodName}
          </Text>
          <View
            style={[
              styles.metaRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <Feather name="zap" size={12} color={colors.accent} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {Math.round(analysis.nutritionData.calories)} kcal
            </Text>
            <Text style={[styles.dot, { color: colors.border }]}>•</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {dateStr}
            </Text>
          </View>
        </View>

        {/* Delete + Arrow */}
        <View
          style={[
            styles.actions,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.deleteBtn, { backgroundColor: colors.destructive + "15" }]}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Feather name="trash-2" size={15} color={colors.destructive} />
          </TouchableOpacity>
          <Feather
            name={isRTL ? "chevron-left" : "chevron-right"}
            size={18}
            color={colors.mutedForeground}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  inner: {
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  scoreDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    alignItems: "center",
    gap: 4,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dot: {
    fontSize: 12,
  },
  actions: {
    alignItems: "center",
    gap: 10,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
  },
});
