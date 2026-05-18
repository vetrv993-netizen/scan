import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

interface NutritionBarProps {
  label: string;
  value: number;
  unit: string;
  maxValue: number;
  color?: string;
  isRTL?: boolean;
  showPercent?: boolean;
}

export function NutritionBar({
  label,
  value,
  unit,
  maxValue,
  color,
  isRTL = false,
  showPercent = false,
}: NutritionBarProps) {
  const colors = useColors();
  const animWidth = useRef(new Animated.Value(0)).current;
  const pct = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct, animWidth]);

  const barColor = color ?? colors.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text
          style={[
            styles.label,
            { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.value, { color: colors.mutedForeground }]}>
          {value.toFixed(1)}
          {unit}
          {showPercent && (
            <Text style={{ color: colors.mutedForeground + "80" }}>
              {" "}
              ({Math.round(pct)}%)
            </Text>
          )}
        </Text>
      </View>
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  value: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  track: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});
