import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useColors } from "@/hooks/useColors";

interface LoadingAnalysisProps {
  stages: string[];
  isRTL?: boolean;
}

export function LoadingAnalysis({ stages, isRTL = false }: LoadingAnalysisProps) {
  const colors = useColors();
  const [stageIndex, setStageIndex] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ring rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Ripple dots
    const ripple = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();

    ripple(scale1, 0);
    ripple(scale2, 300);
    ripple(scale3, 600);

    // Stage cycling
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [stages.length, rotateAnim, fadeAnim, scale1, scale2, scale3]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated rings */}
      <View style={styles.ringContainer}>
        <View style={[styles.outerRing, { borderColor: colors.primary + "20" }]} />
        <View style={[styles.midRing, { borderColor: colors.primary + "40" }]} />
        <Animated.View
          style={[
            styles.spinRing,
            {
              borderTopColor: colors.primary,
              borderRightColor: colors.primary + "40",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
              transform: [{ rotate: spin }],
            },
          ]}
        />
        {/* Center icon */}
        <View style={[styles.centerDot, { backgroundColor: colors.primary }]} />
      </View>

      {/* Ripple dots */}
      <View style={styles.dots}>
        {[scale1, scale2, scale3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.rippleDot,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: anim }],
                opacity: anim.interpolate({ inputRange: [1, 1.5], outputRange: [0.9, 0.3] }),
              },
            ]}
          />
        ))}
      </View>

      {/* Stage text */}
      <Animated.Text
        style={[
          styles.stageText,
          {
            color: colors.foreground,
            opacity: fadeAnim,
            textAlign: "center",
          },
        ]}
      >
        {stages[stageIndex]}
      </Animated.Text>

      {/* Sub text */}
      <Text style={[styles.subText, { color: colors.mutedForeground }]}>
        {isRTL ? "الذكاء الاصطناعي يعمل بأقصى سرعة..." : "AI working at full speed..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    paddingHorizontal: 40,
  },
  ringContainer: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  outerRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  midRing: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
  },
  spinRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  centerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dots: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  rippleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
  },
  subText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
