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
  });
  const timeStr = date.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const score = Math.round(analysis.nutritionData.healthScore);
  const scoreColor =
    score >= 75 ? colors.scoreHigh : score >= 50 ? colors.scoreMid : colors.scoreLow;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      activeOpacity={0.75}
    >
      <View style={[styles.inner, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {/* Score circle */}
        <View
          style={[
            styles.scoreCircle,
            { borderColor: scoreColor + "70", backgroundColor: scoreColor + "14" },
          ]}
        >
          <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
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
            style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}
          >
            <Feather name="zap" size={11} color={colors.accent} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {Math.round(analysis.nutritionData.calories)}{" "}
              {language === "ar" ? "سعرة" : "kcal"}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {dateStr} · {timeStr}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.deleteBtn, { backgroundColor: colors.destructive + "14" }]}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
          </TouchableOpacity>
          <Feather
            name={isRTL ? "chevron-left" : "chevron-right"}
            size={17}
            color={colors.mutedForeground}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inner: {
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  scoreCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  info: { flex: 1, gap: 5 },
  foodName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    alignItems: "center",
    gap: 5,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  actions: { alignItems: "center", gap: 10 },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
