import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { NutritionCard } from "@/components/NutritionCard";
import { HealthInsightCard, WarningTags } from "@/components/HealthInsightCard";

function SectionTitle({
  title, isRTL, colors,
}: {
  title: string;
  isRTL: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
      {title}
    </Text>
  );
}

export default function ResultScreen() {
  const colors = useColors();
  const { t, isRTL, language, history, addToMeal, removeFromMeal, isInMeal } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const analysis = history.find((a) => a.id === id);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;
  const inMeal = analysis ? isInMeal(analysis.id) : false;

  if (!analysis) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
          {t.common.noResults}
        </Text>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>
            {t.common.back}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { nutritionData: data, imageUri } = analysis;
  const foodName = language === "ar" ? data.foodName.ar : data.foodName.en;
  const description = language === "ar" ? data.description.ar : data.description.en;
  const healthBenefits = language === "ar" ? data.healthBenefits.ar : data.healthBenefits.en;
  const healthCautions = language === "ar" ? data.healthCautions.ar : data.healthCautions.en;

  const dateStr = new Date(analysis.createdAt).toLocaleDateString(
    language === "ar" ? "ar-SA" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  const handleAddToMeal = () => {
    if (inMeal) {
      Alert.alert(
        isRTL ? "إزالة من الوجبة" : "Remove from Meal",
        isRTL ? "إزالة هذا الطعام من وجبتك؟" : "Remove this food from your meal?",
        [
          { text: t.common.close, style: "cancel" },
          {
            text: isRTL ? "إزالة" : "Remove",
            style: "destructive",
            onPress: () => removeFromMeal(analysis.id),
          },
        ]
      );
      return;
    }
    addToMeal(analysis);
    setAddedFeedback(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setAddedFeedback(false), 2500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 10,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backCircle, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather
            name={isRTL ? "arrow-right" : "arrow-left"}
            size={18}
            color={colors.foreground}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {t.result.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Food image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.foodImage} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
            <Feather name="image" size={44} color={colors.border} />
          </View>
        )}

        <View style={styles.content}>
          {/* Food name + description */}
          <Text style={[styles.foodName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {foodName}
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
            {description}
          </Text>

          {/* Meta chips */}
          <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
              <Feather name="calendar" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{dateStr}</Text>
            </View>
            {/* Show "Smart AI" instead of model name */}
            <View style={[styles.metaChip, { backgroundColor: colors.primary + "14" }]}>
              <Feather name="cpu" size={12} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.primary }]}>
                {t.result.aiAnalysis}
              </Text>
            </View>
            {data.isEstimated && (
              <View style={[styles.metaChip, { backgroundColor: colors.warning + "18" }]}>
                <Feather name="info" size={12} color={colors.warning} />
                <Text style={[styles.metaText, { color: colors.warning }]}>{t.result.estimated}</Text>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Nutrition card */}
          <NutritionCard data={data} />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Benefits + Cautions + Warnings */}
          <SectionTitle title={t.result.healthBenefits} isRTL={isRTL} colors={colors} />
          <HealthInsightCard title={t.result.healthBenefits} content={healthBenefits} type="benefit" isRTL={isRTL} />

          <SectionTitle title={t.result.healthCautions} isRTL={isRTL} colors={colors} />
          <HealthInsightCard title={t.result.healthCautions} content={healthCautions} type="caution" isRTL={isRTL} />

          <SectionTitle title={t.result.warnings} isRTL={isRTL} colors={colors} />
          <View style={[styles.warningsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <WarningTags
              warnings={data.warnings}
              labels={t.warnings}
              noWarningsText={t.result.noWarnings}
              isRTL={isRTL}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Action buttons */}
          <TouchableOpacity
            style={[
              styles.addMealBtn,
              {
                backgroundColor: inMeal
                  ? colors.success + "18"
                  : addedFeedback
                  ? colors.success
                  : colors.primary,
                borderColor: inMeal ? colors.success : "transparent",
                borderWidth: inMeal ? 1.5 : 0,
              },
            ]}
            onPress={handleAddToMeal}
            activeOpacity={0.85}
          >
            <Feather
              name={inMeal ? "check" : addedFeedback ? "check" : "plus-circle"}
              size={20}
              color={inMeal ? colors.success : colors.primaryForeground}
            />
            <Text
              style={[
                styles.addMealBtnText,
                { color: inMeal ? colors.success : colors.primaryForeground },
              ]}
            >
              {inMeal
                ? isRTL
                  ? "مضاف إلى الوجبة ✓"
                  : "Added to Meal ✓"
                : addedFeedback
                ? t.result.addedToMeal
                : t.result.addToMeal}
            </Text>
          </TouchableOpacity>

          <View style={[styles.secondaryRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
              onPress={() => router.push("/(tabs)/meal")}
            >
              <Feather name="pie-chart" size={16} color={colors.primary} />
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                {t.result.viewMeal}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
              onPress={() => router.push("/(tabs)/analyze")}
            >
              <Feather name="camera" size={16} color={colors.foreground} />
              <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
                {t.result.analyzeAnother}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, alignItems: "center", justifyContent: "space-between",
  },
  backCircle: {
    width: 38, height: 38, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
  scroll: { flex: 1 },
  foodImage: { width: "100%", height: 260 },
  imagePlaceholder: {
    width: "100%", height: 200, alignItems: "center", justifyContent: "center",
  },
  content: { padding: 20 },
  foodName: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 8 },
  description: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, marginBottom: 12 },
  metaRow: { flexWrap: "wrap", gap: 8, marginBottom: 12 },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 4 },
  warningsBox: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  addMealBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 16, paddingVertical: 16, marginBottom: 12,
  },
  addMealBtnText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  secondaryRow: { gap: 10 },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  notFound: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 16, padding: 40,
  },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center" },
  actionBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
