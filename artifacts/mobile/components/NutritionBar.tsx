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
}

export function NutritionBar({
  label,
  value,
  unit,
  maxValue,
  color,
  isRTL = false,
}: NutritionBarProps) {
  const colors = useColors();
  const animWidth = useRef(new Animated.Value(0)).current;
  const pct = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [pct, animWidth]);

  const barColor = color ?? colors.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <Text
          style={[
            styles.label,
            { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.value, { color: colors.mutedForeground }]}>
          {value.toFixed(1)} {unit}
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
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  rowRTL: {
    flexDirection: "row-reverse",
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
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
