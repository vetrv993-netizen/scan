import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface HealthInsightCardProps {
  title: string;
  content: string;
  type: "benefit" | "caution" | "warning";
  isRTL?: boolean;
}

const ICON_MAP = {
  benefit: "check-circle" as const,
  caution: "alert-circle" as const,
  warning: "alert-triangle" as const,
};

export function HealthInsightCard({
  title,
  content,
  type,
  isRTL = false,
}: HealthInsightCardProps) {
  const colors = useColors();

  const colorMap = {
    benefit: { bg: colors.success + "15", border: colors.success, icon: colors.success },
    caution: { bg: colors.warning + "15", border: colors.warning, icon: colors.warning },
    warning: { bg: colors.destructive + "15", border: colors.destructive, icon: colors.destructive },
  };

  const palette = colorMap[type];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.bg,
          borderLeftColor: isRTL ? "transparent" : palette.border,
          borderRightColor: isRTL ? palette.border : "transparent",
          borderLeftWidth: isRTL ? 0 : 4,
          borderRightWidth: isRTL ? 4 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <Feather name={ICON_MAP[type]} size={18} color={palette.icon} />
        <Text
          style={[
            styles.title,
            { color: palette.icon, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.content,
          { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {content}
      </Text>
    </View>
  );
}

interface WarningTagsProps {
  warnings: {
    diabetes: boolean;
    bloodPressure: boolean;
    allergies: string[];
    kidney: boolean;
    lowCarb: boolean;
    glutenSensitivity: boolean;
    lactoseIntolerance: boolean;
    highFat: boolean;
    highSugar: boolean;
  };
  labels: {
    diabetes: string;
    bloodPressure: string;
    allergies: string;
    kidney: string;
    lowCarb: string;
    glutenSensitivity: string;
    lactoseIntolerance: string;
    highFat: string;
    highSugar: string;
  };
  noWarningsText: string;
  isRTL?: boolean;
}

export function WarningTags({
  warnings,
  labels,
  noWarningsText,
  isRTL = false,
}: WarningTagsProps) {
  const colors = useColors();

  const activeTags: string[] = [];
  if (warnings.diabetes) activeTags.push(labels.diabetes);
  if (warnings.bloodPressure) activeTags.push(labels.bloodPressure);
  if (warnings.kidney) activeTags.push(labels.kidney);
  if (warnings.lowCarb) activeTags.push(labels.lowCarb);
  if (warnings.glutenSensitivity) activeTags.push(labels.glutenSensitivity);
  if (warnings.lactoseIntolerance) activeTags.push(labels.lactoseIntolerance);
  if (warnings.highFat) activeTags.push(labels.highFat);
  if (warnings.highSugar) activeTags.push(labels.highSugar);
  if (warnings.allergies.length > 0)
    activeTags.push(`${labels.allergies}: ${warnings.allergies.join(", ")}`);

  if (activeTags.length === 0) {
    return (
      <Text
        style={[
          styles.noWarnings,
          {
            color: colors.success,
            textAlign: isRTL ? "right" : "left",
          },
        ]}
      >
        ✓ {noWarningsText}
      </Text>
    );
  }

  return (
    <View
      style={[
        styles.tagsContainer,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      {activeTags.map((tag, i) => (
        <View
          key={i}
          style={[
            styles.tag,
            { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" },
          ]}
        >
          <Text style={[styles.tagText, { color: colors.destructive }]}>
            {tag}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  content: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  tagsContainer: {
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  noWarnings: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
