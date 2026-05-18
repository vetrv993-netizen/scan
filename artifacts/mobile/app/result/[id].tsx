import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { NutritionCard } from "@/components/NutritionCard";
import {
  HealthInsightCard,
  WarningTags,
} from "@/components/HealthInsightCard";

export default function ResultScreen() {
  const colors = useColors();
  const { t, isRTL, language, history } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const analysis = history.find((a) => a.id === id);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  if (!analysis) {
    return (
      <View
        style={[
          styles.notFound,
          { backgroundColor: colors.background },
        ]}
      >
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
          {t.common.noResults}
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>{t.common.back}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { nutritionData: data, imageUri, modelUsed } = analysis;
  const foodName = language === "ar" ? data.foodName.ar : data.foodName.en;
  const description = language === "ar" ? data.description.ar : data.description.en;
  const healthBenefits = language === "ar" ? data.healthBenefits.ar : data.healthBenefits.en;
  const healthCautions = language === "ar" ? data.healthCautions.ar : data.healthCautions.en;

  const date = new Date(analysis.createdAt);
  const dateStr = date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          style={[styles.backCircle, { backgroundColor: colors.card }]}
        >
          <Feather
            name={isRTL ? "arrow-right" : "arrow-left"}
            size={20}
            color={colors.foreground}
          />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {t.result.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: bottomPadding + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Food image */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.foodImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
            <Feather name="image" size={48} color={colors.border} />
          </View>
        )}

        <View style={styles.content}>
          {/* Food meta */}
          <Text
            style={[
              styles.foodName,
              { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {foodName}
          </Text>
          <Text
            style={[
              styles.description,
              { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {description}
          </Text>
          <View
            style={[
              styles.metaRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
              <Feather name="calendar" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {dateStr}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
              <Feather name="cpu" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {modelUsed}
              </Text>
            </View>
            {data.isEstimated && (
              <View style={[styles.metaChip, { backgroundColor: colors.warning + "20" }]}>
                <Feather name="info" size={12} color={colors.warning} />
                <Text style={[styles.metaText, { color: colors.warning }]}>
                  {t.result.estimated}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Nutrition data */}
          <NutritionCard data={data} />

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Health Benefits */}
          <SectionTitle title={t.result.healthBenefits} isRTL={isRTL} colors={colors} />
          <HealthInsightCard
            title={t.result.healthBenefits}
            content={healthBenefits}
            type="benefit"
            isRTL={isRTL}
          />

          {/* Health Cautions */}
          <SectionTitle title={t.result.healthCautions} isRTL={isRTL} colors={colors} />
          <HealthInsightCard
            title={t.result.healthCautions}
            content={healthCautions}
            type="caution"
            isRTL={isRTL}
          />

          {/* Warnings */}
          <SectionTitle title={t.result.warnings} isRTL={isRTL} colors={colors} />
          <View style={[styles.warningsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <WarningTags
              warnings={data.warnings}
              labels={t.warnings}
              noWarningsText={t.result.noWarnings}
              isRTL={isRTL}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({
  title,
  isRTL,
  colors,
}: {
  title: string;
  isRTL: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  foodImage: {
    width: "100%",
    height: 240,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
  },
  foodName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    marginBottom: 12,
  },
  metaRow: {
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    marginTop: 4,
  },
  warningsBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 40,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
