import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useColors } from "@/hooks/useColors";

interface LoadingAnalysisProps {
  stages: string[];
  isRTL?: boolean;
}

export function LoadingAnalysis({ stages, isRTL = false }: LoadingAnalysisProps) {
  const colors = useColors();
  const [currentStage, setCurrentStage] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Stage cycling
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        const next = (prev + 1) % stages.length;
        // Fade out/in
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [stages.length, rotateAnim, pulseAnim, fadeAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Spinner */}
      <View style={styles.spinnerWrapper}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View
            style={[styles.outerRing, { borderColor: colors.primary + "30" }]}
          >
            <View
              style={[styles.innerRing, { borderColor: colors.primary + "60" }]}
            >
              <Animated.View
                style={[
                  styles.spinArc,
                  {
                    borderTopColor: colors.primary,
                    transform: [{ rotate: spin }],
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Stage text */}
      <Animated.Text
        style={[
          styles.stageText,
          {
            color: colors.foreground,
            opacity: fadeAnim,
            textAlign: isRTL ? "right" : "center",
          },
        ]}
      >
        {stages[currentStage]}
      </Animated.Text>

      {/* Progress dots */}
      <View style={styles.dots}>
        {stages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === currentStage ? colors.primary : colors.border,
                width: i === currentStage ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  spinnerWrapper: {
    marginBottom: 32,
  },
  outerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  innerRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  spinArc: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "transparent",
  },
  stageText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
