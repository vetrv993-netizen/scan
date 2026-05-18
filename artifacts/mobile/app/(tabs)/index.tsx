import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { HistoryItem } from "@/components/HistoryItem";

export default function HomeScreen() {
  const colors = useColors();
  const { t, isRTL, history, deleteAnalysis } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tipIndex] = useState(() => Math.floor(Math.random() * t.home.tips.length));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const recent = history.slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPadding + 16,
        paddingBottom: bottomPadding + 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View>
            <Text style={[styles.appName, { color: colors.primary, textAlign: isRTL ? "right" : "left" }]}>
              {t.appName}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
              {t.home.subtitle}
            </Text>
          </View>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Feather name="activity" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* CTA Card */}
        <TouchableOpacity
          style={[styles.ctaCard, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/analyze")}
          activeOpacity={0.88}
        >
          <View style={[styles.ctaInner, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={styles.ctaText}>
              <Text style={[styles.ctaTitle, { textAlign: isRTL ? "right" : "left" }]}>
                {t.home.analyzeNow}
              </Text>
              <Text style={[styles.ctaHint, { textAlign: isRTL ? "right" : "left" }]}>
                {isRTL ? "📷 التقط صورة وابدأ التحليل" : "📷 Take a photo & start analysis"}
              </Text>
            </View>
            <View style={[styles.ctaIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather
                name={isRTL ? "arrow-left" : "arrow-right"}
                size={22}
                color="#FFFFFF"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Health Tip */}
        <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.tipHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Feather name="sun" size={16} color={colors.accent} />
            <Text style={[styles.tipTitle, { color: colors.accent }]}>
              {t.home.healthTip}
            </Text>
          </View>
          <Text style={[styles.tipText, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {t.home.tips[tipIndex]}
          </Text>
        </View>

        {/* Stats row */}
        {history.length > 0 && (
          <View style={[styles.statsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{history.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {t.home.totalAnalyses}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.accent }]}>
                {history.length > 0
                  ? Math.round(
                      history.reduce(
                        (sum, a) => sum + a.nutritionData.healthScore,
                        0
                      ) / history.length
                    )
                  : 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {isRTL ? "متوسط النقاط" : "Avg Score"}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.info }]}>
                {history.length > 0
                  ? Math.round(
                      history.reduce(
                        (sum, a) => sum + a.nutritionData.calories,
                        0
                      ) / history.length
                    )
                  : 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {isRTL ? "متوسط السعرات" : "Avg kcal"}
              </Text>
            </View>
          </View>
        )}

        {/* Recent analyses */}
        <View style={[styles.sectionHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t.home.recentTitle}
          </Text>
          {history.length > 3 && (
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                {t.home.viewAll}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {recent.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={36} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t.home.noHistory}
            </Text>
          </View>
        ) : (
          recent.map((analysis) => (
            <HistoryItem
              key={analysis.id}
              analysis={analysis}
              onPress={() => router.push({ pathname: "/result/[id]", params: { id: analysis.id } })}
              onDelete={() => deleteAnalysis(analysis.id)}
            />
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  appName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  ctaInner: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaText: { flex: 1 },
  ctaTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  ctaHint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  tipCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  tipHeader: {
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  statsRow: {
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  viewAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
});
