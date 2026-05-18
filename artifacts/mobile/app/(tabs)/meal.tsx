import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { computeMealTotals } from "@/types/nutrition";
import type { StoredAnalysis, SavedMeal } from "@/types/nutrition";
import { NutritionBar } from "@/components/NutritionBar";

type MealTab = "current" | "saved";

function MealScoreCircle({ score, colors }: { score: number; colors: ReturnType<typeof useColors> }) {
  const color = score >= 70 ? colors.scoreHigh : score >= 45 ? colors.scoreMid : colors.scoreLow;
  return (
    <View style={[styles.scoreCircle, { borderColor: color, backgroundColor: color + "14" }]}>
      <Text style={[styles.scoreNum, { color }]}>{score}</Text>
      <Text style={[styles.scoreLabel, { color }]}>/100</Text>
    </View>
  );
}

function MealItemCard({
  item,
  onRemove,
  isRTL,
  language,
}: {
  item: StoredAnalysis;
  onRemove: () => void;
  isRTL: boolean;
  language: string;
}) {
  const colors = useColors();
  const name =
    language === "ar" ? item.nutritionData.foodName.ar : item.nutritionData.foodName.en;

  return (
    <View
      style={[
        styles.mealItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          flexDirection: isRTL ? "row-reverse" : "row",
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.mealItemIcon, { backgroundColor: colors.primary + "14" }]}>
        <Feather name="coffee" size={18} color={colors.primary} />
      </View>
      <View style={[styles.mealItemInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text
          style={[styles.mealItemName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={[styles.mealItemCals, { color: colors.mutedForeground }]}>
          {item.nutritionData.calories} {language === "ar" ? "سعرة" : "kcal"} ·{" "}
          {item.nutritionData.macros.protein.toFixed(1)}g{" "}
          {language === "ar" ? "بروتين" : "protein"}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        style={[styles.removeBtn, { backgroundColor: colors.destructive + "14" }]}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Feather name="minus" size={15} color={colors.destructive} />
      </TouchableOpacity>
    </View>
  );
}

function SavedMealCard({
  meal,
  onDelete,
  isRTL,
  language,
}: {
  meal: SavedMeal;
  onDelete: () => void;
  isRTL: boolean;
  language: string;
}) {
  const colors = useColors();
  const scoreColor =
    meal.totals.healthScore >= 70
      ? colors.scoreHigh
      : meal.totals.healthScore >= 45
      ? colors.scoreMid
      : colors.scoreLow;

  const date = new Date(meal.createdAt);
  const dateStr = date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <View
      style={[
        styles.savedCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.savedCardHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.savedName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
          >
            {meal.name}
          </Text>
          <Text style={[styles.savedMeta, { color: colors.mutedForeground }]}>
            {meal.items.length} {language === "ar" ? "طعام" : "foods"} · {dateStr}
          </Text>
        </View>
        <View
          style={[
            styles.savedScoreBadge,
            { backgroundColor: scoreColor + "18", borderColor: scoreColor + "40" },
          ]}
        >
          <Text style={[styles.savedScoreText, { color: scoreColor }]}>
            {meal.totals.healthScore}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          style={[styles.removeBtn, { backgroundColor: colors.destructive + "14", marginStart: 6 }]}
        >
          <Feather name="trash-2" size={14} color={colors.destructive} />
        </TouchableOpacity>
      </View>
      <View style={[styles.savedTotals, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {[
          { label: language === "ar" ? "سعرات" : "kcal", value: meal.totals.calories, color: colors.accent },
          { label: language === "ar" ? "بروتين" : "P", value: `${meal.totals.protein}g`, color: "#3B82F6" },
          { label: language === "ar" ? "دهون" : "F", value: `${meal.totals.fat}g`, color: "#F59E0B" },
          { label: language === "ar" ? "كربو" : "C", value: `${meal.totals.carbohydrates}g`, color: "#A855F7" },
        ].map((item, i) => (
          <View key={i} style={[styles.savedTotalItem, { backgroundColor: item.color + "14" }]}>
            <Text style={[styles.savedTotalValue, { color: item.color }]}>{item.value}</Text>
            <Text style={[styles.savedTotalLabel, { color: colors.mutedForeground }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MealScreen() {
  const colors = useColors();
  const { t, isRTL, language, currentMeal, removeFromMeal, clearMeal, saveMeal, savedMeals, deleteSavedMeal } =
    useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<MealTab>("current");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mealName, setMealName] = useState("");

  const totals = computeMealTotals(currentMeal);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleRemove = (item: StoredAnalysis) => {
    Alert.alert(
      isRTL ? "إزالة من الوجبة" : "Remove from Meal",
      t.meal.confirmRemove,
      [
        { text: t.meal.no, style: "cancel" },
        { text: t.meal.yes, style: "destructive", onPress: () => removeFromMeal(item.id) },
      ]
    );
  };

  const handleClear = () => {
    Alert.alert(
      isRTL ? "مسح الوجبة" : "Clear Meal",
      t.meal.confirmClear,
      [
        { text: t.meal.no, style: "cancel" },
        { text: t.meal.yes, style: "destructive", onPress: clearMeal },
      ]
    );
  };

  const handleSave = () => {
    const name = mealName.trim();
    if (!name) return;
    saveMeal(name);
    setMealName("");
    setShowSaveModal(false);
    Alert.alert("", t.meal.mealSaved);
  };

  const handleDeleteSaved = (id: string) => {
    Alert.alert(
      isRTL ? "حذف الوجبة" : "Delete Meal",
      t.meal.confirmDelete,
      [
        { text: t.meal.no, style: "cancel" },
        { text: t.meal.deleteMeal, style: "destructive", onPress: () => deleteSavedMeal(id) },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.meal.title}</Text>
        {activeTab === "current" && currentMeal.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={[styles.clearBtn, { backgroundColor: colors.destructive + "14" }]}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
            <Text style={[styles.clearBtnText, { color: colors.destructive }]}>
              {t.meal.clearMeal}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Segment control */}
      <View
        style={[
          styles.segmentWrapper,
          { paddingHorizontal: 20, paddingVertical: 12 },
        ]}
      >
        <View style={[styles.segmentBar, { backgroundColor: colors.muted }]}>
          {(["current", "saved"] as MealTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.segmentBtn,
                activeTab === tab && { backgroundColor: colors.card, shadowColor: colors.shadow },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: activeTab === tab ? colors.foreground : colors.mutedForeground,
                    fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {tab === "current" ? t.meal.tabCurrent : t.meal.tabSaved}
                {tab === "current" && currentMeal.length > 0 && (
                  <Text style={{ color: colors.primary }}> ({currentMeal.length})</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {activeTab === "current" ? (
        currentMeal.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "14" }]}>
              <Feather name="pie-chart" size={44} color={colors.primary} />
            </View>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground, textAlign: "center" }]}
            >
              {t.meal.empty}
            </Text>
            <TouchableOpacity
              style={[styles.addFoodBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/analyze")}
            >
              <Feather name="camera" size={16} color={colors.primaryForeground} />
              <Text style={[styles.addFoodBtnText, { color: colors.primaryForeground }]}>
                {t.meal.addMore}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding + 100, gap: 0 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Items */}
            <View style={styles.itemsList}>
              {currentMeal.map((item) => (
                <MealItemCard
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemove(item)}
                  isRTL={isRTL}
                  language={language}
                />
              ))}
              <TouchableOpacity
                style={[
                  styles.addMoreRow,
                  { borderColor: colors.primary + "50", backgroundColor: colors.primary + "0A" },
                ]}
                onPress={() => router.push("/(tabs)/analyze")}
              >
                <Feather name="plus" size={16} color={colors.primary} />
                <Text style={[styles.addMoreText, { color: colors.primary }]}>
                  {t.meal.addMore}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nutrition Totals */}
            <View
              style={[
                styles.totalsCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={[styles.totalsHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Text style={[styles.totalsTitle, { color: colors.foreground }]}>
                  {t.meal.totals}
                </Text>
                <MealScoreCircle score={totals.healthScore} colors={colors} />
              </View>

              {/* Calories big display */}
              <View style={[styles.calRow, { backgroundColor: colors.secondary }]}>
                <Feather name="zap" size={20} color={colors.accent} />
                <Text style={[styles.calNum, { color: colors.accent }]}>{totals.calories}</Text>
                <Text style={[styles.calUnit, { color: colors.mutedForeground }]}>
                  {language === "ar" ? "سعرة حرارية" : "kcal"}
                </Text>
              </View>

              {/* Macro bars */}
              <View style={styles.macros}>
                <NutritionBar label={language === "ar" ? "بروتين" : "Protein"} value={totals.protein} unit="g" maxValue={Math.max(totals.protein * 2, 50)} color="#3B82F6" isRTL={isRTL} />
                <NutritionBar label={language === "ar" ? "دهون" : "Fat"} value={totals.fat} unit="g" maxValue={Math.max(totals.fat * 2, 50)} color="#F59E0B" isRTL={isRTL} />
                <NutritionBar label={language === "ar" ? "كربوهيدرات" : "Carbs"} value={totals.carbohydrates} unit="g" maxValue={Math.max(totals.carbohydrates * 2, 100)} color="#A855F7" isRTL={isRTL} />
                <NutritionBar label={language === "ar" ? "ألياف" : "Fiber"} value={totals.fiber} unit="g" maxValue={Math.max(totals.fiber * 2, 30)} color="#22C55E" isRTL={isRTL} />
                <NutritionBar label={language === "ar" ? "سكر" : "Sugar"} value={totals.sugar} unit="g" maxValue={Math.max(totals.sugar * 2, 50)} color="#EF4444" isRTL={isRTL} />
              </View>

              {/* Minerals grid */}
              <View style={[styles.mineralsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {[
                  { label: language === "ar" ? "صوديوم" : "Sodium", value: totals.sodium, unit: "mg" },
                  { label: language === "ar" ? "كالسيوم" : "Calcium", value: totals.calcium, unit: "mg" },
                  { label: language === "ar" ? "حديد" : "Iron", value: totals.iron, unit: "mg" },
                ].map((m, i) => (
                  <View key={i} style={[styles.mineralChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Text style={[styles.mineralVal, { color: colors.foreground }]}>{m.value}</Text>
                    <Text style={[styles.mineralUnit, { color: colors.mutedForeground }]}>{m.unit}</Text>
                    <Text style={[styles.mineralLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Save meal button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={() => setShowSaveModal(true)}
            >
              <Feather name="bookmark" size={18} color={colors.primaryForeground} />
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                {t.meal.saveMeal}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )
      ) : (
        // Saved meals tab
        savedMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "14" }]}>
              <Feather name="bookmark" size={44} color={colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, textAlign: "center" }]}>
              {t.meal.savedEmpty}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding + 100, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {savedMeals.map((meal) => (
              <SavedMealCard
                key={meal.id}
                meal={meal}
                onDelete={() => handleDeleteSaved(meal.id)}
                isRTL={isRTL}
                language={language}
              />
            ))}
          </ScrollView>
        )
      )}

      {/* Save Modal */}
      <Modal visible={showSaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {t.meal.saveMeal}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              placeholder={t.meal.mealNamePlaceholder}
              placeholderTextColor={colors.mutedForeground}
              value={mealName}
              onChangeText={setMealName}
              autoFocus
            />
            <View style={[styles.modalBtns, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted, flex: 1 }]}
                onPress={() => { setShowSaveModal(false); setMealName(""); }}
              >
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>
                  {t.meal.no}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: mealName.trim() ? colors.primary : colors.muted, flex: 1 },
                ]}
                onPress={handleSave}
                disabled={!mealName.trim()}
              >
                <Text
                  style={[
                    styles.modalBtnText,
                    { color: mealName.trim() ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {t.meal.save}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, justifyContent: "space-between", alignItems: "center",
  },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  clearBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  clearBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  segmentWrapper: {},
  segmentBar: {
    flexDirection: "row", borderRadius: 12, padding: 4,
  },
  segmentBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  segmentText: { fontSize: 14 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 18, padding: 40 },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, maxWidth: 260 },
  addFoodBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
  },
  addFoodBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  itemsList: { gap: 8, marginBottom: 16 },
  mealItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 13, borderRadius: 13, borderWidth: 1,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  mealItemIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  mealItemInfo: { flex: 1 },
  mealItemName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  mealItemCals: { fontSize: 12, fontFamily: "Inter_400Regular" },
  removeBtn: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  addMoreRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 13, borderRadius: 13, borderWidth: 1, borderStyle: "dashed",
  },
  addMoreText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  totalsCard: {
    borderRadius: 18, borderWidth: 1, padding: 18, gap: 16, marginBottom: 16,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  totalsHeader: { justifyContent: "space-between", alignItems: "center" },
  totalsTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scoreCircle: {
    width: 62, height: 62, borderRadius: 31, borderWidth: 2.5,
    alignItems: "center", justifyContent: "center",
  },
  scoreNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  calRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 12, paddingVertical: 12, gap: 6,
  },
  calNum: { fontSize: 32, fontFamily: "Inter_700Bold" },
  calUnit: { fontSize: 14, fontFamily: "Inter_400Regular", alignSelf: "flex-end", marginBottom: 4 },
  macros: { gap: 0 },
  mineralsRow: { gap: 8 },
  mineralChip: {
    flex: 1, borderRadius: 12, padding: 10, alignItems: "center", borderWidth: 1,
  },
  mineralVal: { fontSize: 17, fontFamily: "Inter_700Bold" },
  mineralUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  mineralLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 16, paddingVertical: 16, marginBottom: 8,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  saveBtnText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  savedCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  savedCardHeader: { alignItems: "center", gap: 10 },
  savedName: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  savedMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  savedScoreBadge: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  savedScoreText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  savedTotals: { gap: 8 },
  savedTotalItem: {
    flex: 1, borderRadius: 10, padding: 8, alignItems: "center",
  },
  savedTotalValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  savedTotalLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalBox: {
    width: "100%", maxWidth: 360, borderRadius: 20,
    padding: 24, gap: 16, borderWidth: 1,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  modalInput: {
    borderWidth: 1, borderRadius: 12, padding: 13,
    fontSize: 15, fontFamily: "Inter_400Regular",
  },
  modalBtns: { gap: 10 },
  modalBtn: {
    paddingVertical: 12, borderRadius: 12, alignItems: "center",
  },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
