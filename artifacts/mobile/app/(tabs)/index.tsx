import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { StoredAnalysis } from "@/types/nutrition";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
        <Feather name={icon as "activity"} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function HistoryRow({ item, isRTL }: { item: StoredAnalysis; isRTL: boolean }) {
  const colors = useColors();
  const { language } = useApp();
  const router = useRouter();
  const scoreColor =
    item.nutritionData.healthScore >= 70
      ? colors.scoreHigh
      : item.nutritionData.healthScore >= 45
      ? colors.scoreMid
      : colors.scoreLow;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/result/${item.id}`)}
      style={[
        styles.histRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          flexDirection: isRTL ? "row-reverse" : "row",
          shadowColor: colors.shadow,
        },
      ]}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.scoreCircle,
          { borderColor: scoreColor + "60", backgroundColor: scoreColor + "14" },
        ]}
      >
        <Text style={[styles.scoreCircleText, { color: scoreColor }]}>
          {item.nutritionData.healthScore}
        </Text>
      </View>
      <View style={[styles.histInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.histName, { color: colors.foreground }]} numberOfLines={1}>
          {language === "ar"
            ? item.nutritionData.foodName.ar
            : item.nutritionData.foodName.en}
        </Text>
        <Text style={[styles.histCals, { color: colors.mutedForeground }]}>
          {item.nutritionData.calories} {language === "ar" ? "سعرة" : "kcal"}
        </Text>
      </View>
      <Feather
        name={isRTL ? "chevron-left" : "chevron-right"}
        size={16}
        color={colors.mutedForeground}
      />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { t, history, isRTL, language, currentMeal } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tipIndex, setTipIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
      setTipIndex((prev) => (prev + 1) % t.home.tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [fadeAnim, entryAnim, t.home.tips.length]);

  const totalCalories =
    history.length > 0
      ? Math.round(
          history.reduce((s, a) => s + a.nutritionData.calories, 0) / history.length
        )
      : 0;
  const avgScore =
    history.length > 0
      ? Math.round(
          history.reduce((s, a) => s + a.nutritionData.healthScore, 0) / history.length
        )
      : 0;
  const recent = history.slice(0, 5);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topPadding + 20,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        style={{ opacity: entryAnim }}
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View>
            <Text
              style={[styles.appName, { color: colors.primary, textAlign: isRTL ? "right" : "left" }]}
            >
              {t.appName}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}
            >
              {t.home.subtitle}
            </Text>
          </View>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={20} color={colors.primaryForeground} />
          </View>
        </View>

        {/* Active meal banner */}
        {currentMeal.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/meal")}
            style={[
              styles.mealBanner,
              {
                backgroundColor: colors.primary + "13",
                borderColor: colors.primary + "45",
                flexDirection: isRTL ? "row-reverse" : "row",
              },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="pie-chart" size={17} color={colors.primary} />
            <Text style={[styles.mealBannerText, { color: colors.primary }]}>
              {t.home.mealBanner}:{" "}
              <Text style={{ fontFamily: "Inter_700Bold" }}>
                {currentMeal.length} {t.home.mealItems}
              </Text>
            </Text>
            <Feather
              name={isRTL ? "chevron-left" : "chevron-right"}
              size={15}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}

        {/* Analyze CTA */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/analyze")}
          style={[styles.ctaCard, { backgroundColor: colors.primary }]}
          activeOpacity={0.86}
        >
          <View style={[styles.ctaInner, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.ctaTitle, { textAlign: isRTL ? "right" : "left" }]}
              >
                {t.home.analyzeNow}
              </Text>
              <Text
                style={[styles.ctaSub, { textAlign: isRTL ? "right" : "left" }]}
              >
                {language === "ar" ? "اختر صورة أو التقط طعامك" : "Upload or take a photo"}
              </Text>
            </View>
            <View style={styles.ctaIconBox}>
              <Feather name="camera" size={26} color={colors.primaryForeground} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Stats */}
        {history.length > 0 && (
          <View style={styles.statsRow}>
            <StatCard
              label={t.home.totalAnalyses}
              value={history.length}
              icon="activity"
              color={colors.primary}
            />
            <StatCard
              label={t.home.avgScore}
              value={`${avgScore}`}
              icon="star"
              color={colors.warning}
            />
            <StatCard
              label={t.home.avgCalories}
              value={totalCalories}
              icon="zap"
              color={colors.info}
            />
          </View>
        )}

        {/* Health tip */}
        <View
          style={[
            styles.tipCard,
            { backgroundColor: colors.primary + "0D", borderColor: colors.primary + "2E" },
          ]}
        >
          <View style={[styles.tipHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Feather name="sun" size={14} color={colors.primary} />
            <Text style={[styles.tipLabel, { color: colors.primary }]}>{t.home.healthTip}</Text>
          </View>
          <Animated.Text
            style={[
              styles.tipText,
              { color: colors.foreground, opacity: fadeAnim, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t.home.tips[tipIndex]}
          </Animated.Text>
        </View>

        {/* Recent */}
        {recent.length > 0 ? (
          <View style={styles.section}>
            <View
              style={[styles.sectionHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {t.home.recentTitle}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
                <Text style={[styles.viewAll, { color: colors.primary }]}>
                  {t.home.viewAll}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.histList}>
              {recent.map((item) => (
                <HistoryRow key={item.id} item={item} isRTL={isRTL} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + "14" }]}>
              <Feather name="camera" size={40} color={colors.primary} />
            </View>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground, textAlign: "center" }]}
            >
              {t.home.noHistory}
            </Text>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 18 },
  header: { justifyContent: "space-between", alignItems: "center" },
  appName: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  logoMark: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  mealBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 13, borderWidth: 1,
  },
  mealBannerText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  ctaCard: { borderRadius: 18, overflow: "hidden" },
  ctaInner: {
    alignItems: "center", justifyContent: "space-between",
    padding: 20, gap: 16,
  },
  ctaTitle: {
    fontSize: 18, fontFamily: "Inter_700Bold",
    color: "#FFFFFF", marginBottom: 4,
  },
  ctaSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.80)" },
  ctaIconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center", justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  tipCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  tipHeader: { gap: 6, alignItems: "center" },
  tipLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  tipText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  section: { gap: 12 },
  sectionHeader: { justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  viewAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  histList: { gap: 8 },
  histRow: {
    borderRadius: 13, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  scoreCircle: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  scoreCircleText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  histInfo: { flex: 1 },
  histName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  histCals: { fontSize: 12, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 16 },
  emptyIconBox: {
    width: 88, height: 88, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, maxWidth: 260 },
});
