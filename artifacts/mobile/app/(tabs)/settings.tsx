import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, type ThemeMode } from "@/context/AppContext";
import type { Language } from "@/constants/translations";
import type { AIModel } from "@/types/nutrition";

const AI_MODELS: AIModel[] = ["auto", "openai", "gemini", "claude"];

function SectionTitle({
  label,
  isRTL,
  colors,
}: {
  label: string;
  isRTL: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" },
      ]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

function SettingsCard({ children, colors }: { children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const {
    t, isRTL, language, setLanguage,
    themeMode, setThemeMode,
    aiModel, setAiModel,
    clearHistory, clearMeal,
  } = useApp();
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleClearHistory = () => {
    Alert.alert(t.settings.clearHistory, t.settings.confirmClear, [
      { text: t.settings.no, style: "cancel" },
      { text: t.settings.yes, style: "destructive", onPress: clearHistory },
    ]);
  };

  const handleClearMeal = () => {
    Alert.alert(t.settings.clearMeal, t.settings.confirmClear, [
      { text: t.settings.no, style: "cancel" },
      { text: t.settings.yes, style: "destructive", onPress: clearMeal },
    ]);
  };

  const handleCall = () => Linking.openURL(`tel:${t.settings.developerPhone}`);
  const handleEmail = () => Linking.openURL(`mailto:${t.settings.developerEmail}`);

  const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: "light", label: t.settings.light, icon: "sun" },
    { mode: "dark", label: t.settings.dark, icon: "moon" },
    { mode: "system", label: t.settings.system, icon: "smartphone" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPadding + 20,
        paddingBottom: bottomPadding + 100,
        paddingHorizontal: 20,
        gap: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
        {t.settings.title}
      </Text>

      {/* Language */}
      <View style={styles.section}>
        <SectionTitle label={t.settings.language} isRTL={isRTL} colors={colors} />
        <SettingsCard colors={colors}>
          <View style={[styles.optionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {(["ar", "en"] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.segChip,
                  {
                    flex: 1,
                    backgroundColor: language === lang ? colors.primary : "transparent",
                    borderColor: language === lang ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Text
                  style={[
                    styles.segText,
                    { color: language === lang ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {lang === "ar" ? t.settings.arabic : t.settings.english}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsCard>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <SectionTitle label={t.settings.appearance} isRTL={isRTL} colors={colors} />
        <SettingsCard colors={colors}>
          <View style={[styles.optionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            {themeOptions.map(({ mode, label, icon }) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.segChip,
                  {
                    flex: 1,
                    backgroundColor: themeMode === mode ? colors.primary : "transparent",
                    borderColor: themeMode === mode ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Feather
                  name={icon as "sun"}
                  size={14}
                  color={themeMode === mode ? colors.primaryForeground : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.segText,
                    { color: themeMode === mode ? colors.primaryForeground : colors.foreground, fontSize: 12 },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsCard>
      </View>

      {/* AI Models (advanced) */}
      <View style={styles.section}>
        <SectionTitle label={t.settings.aiSection} isRTL={isRTL} colors={colors} />
        <SettingsCard colors={colors}>
          <Text
            style={[
              styles.cardSubLabel,
              { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t.settings.aiModel}
          </Text>
          {AI_MODELS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.radioRow,
                {
                  backgroundColor: aiModel === m ? colors.primary + "0E" : "transparent",
                  borderColor: aiModel === m ? colors.primary : colors.border,
                  flexDirection: isRTL ? "row-reverse" : "row",
                },
              ]}
              onPress={() => setAiModel(m)}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: aiModel === m ? colors.primary : colors.border },
                ]}
              >
                {aiModel === m && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <View style={[styles.radioContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                <Text style={[styles.radioLabel, { color: colors.foreground }]}>
                  {t.analyze.models[m]}
                </Text>
                {m === "auto" && (
                  <Text style={[styles.radioHint, { color: colors.mutedForeground }]}>
                    {isRTL ? "يستخدم أسرع نموذج تلقائياً" : "Uses the fastest available model"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </SettingsCard>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <SectionTitle label={t.settings.data} isRTL={isRTL} colors={colors} />
        <SettingsCard colors={colors}>
          <ActionRow
            icon="clock"
            label={t.settings.clearHistory}
            hint={t.settings.clearHistoryDesc}
            onPress={handleClearHistory}
            isRTL={isRTL}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ActionRow
            icon="pie-chart"
            label={t.settings.clearMeal}
            hint={t.settings.clearMealDesc}
            onPress={handleClearMeal}
            isRTL={isRTL}
            colors={colors}
          />
        </SettingsCard>
      </View>

      {/* Developer */}
      <View style={styles.section}>
        <SectionTitle label={t.settings.developer} isRTL={isRTL} colors={colors} />
        <View
          style={[
            styles.devCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={[styles.devHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.devAvatar, { backgroundColor: colors.primary }]}>
              <Feather name="user" size={26} color={colors.primaryForeground} />
            </View>
            <View style={[styles.devInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
              <Text
                style={[
                  styles.devName,
                  { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t.settings.developerName}
              </Text>
              <Text style={[styles.devRole, { color: colors.mutedForeground }]}>
                {isRTL ? "مطور التطبيق" : "App Developer"}
              </Text>
            </View>
          </View>
          <View style={[styles.devActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handleCall}
            >
              <Feather name="phone" size={15} color={colors.primaryForeground} />
              <Text style={[styles.devBtnText, { color: colors.primaryForeground }]}>
                {t.settings.call}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.devBtn,
                { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, flex: 1 },
              ]}
              onPress={handleEmail}
            >
              <Feather name="mail" size={15} color={colors.primary} />
              <Text style={[styles.devBtnText, { color: colors.primary }]}>
                {t.settings.email}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactList}>
            {[
              { icon: "phone", text: t.settings.developerPhone },
              { icon: "mail", text: t.settings.developerEmail },
            ].map((c, i) => (
              <View key={i} style={[styles.contactRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Feather name={c.icon as "phone"} size={13} color={colors.mutedForeground} />
                <Text style={[styles.contactText, { color: colors.mutedForeground }]}>{c.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        {t.settings.version} 2.0 · Smart Nutrition AI
      </Text>
    </ScrollView>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  onPress,
  isRTL,
  colors,
}: {
  icon: string;
  label: string;
  hint: string;
  onPress: () => void;
  isRTL: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.destructive + "14" }]}>
        <Feather name={icon as "clock"} size={16} color={colors.destructive} />
      </View>
      <View style={[styles.actionContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.actionLabel, { color: colors.destructive }]}>{label}</Text>
        <Text style={[styles.actionHint, { color: colors.mutedForeground }]}>{hint}</Text>
      </View>
      <Feather
        name={isRTL ? "chevron-left" : "chevron-right"}
        size={16}
        color={colors.mutedForeground}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.9, paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16, borderWidth: 1, padding: 14, gap: 10,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardSubLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 4 },
  optionRow: { gap: 8 },
  segChip: {
    paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 11, borderWidth: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
  },
  segText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  radioRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 11, borderWidth: 1,
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioContent: { flex: 1, gap: 2 },
  radioLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  radioHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 4 },
  actionRow: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6,
  },
  actionIcon: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  actionContent: { flex: 1, gap: 2 },
  actionLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  actionHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  devCard: {
    borderRadius: 18, borderWidth: 1, padding: 18, gap: 16,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  devHeader: { alignItems: "center", gap: 14 },
  devAvatar: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  devInfo: { flex: 1, gap: 4 },
  devName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  devRole: { fontSize: 13, fontFamily: "Inter_400Regular" },
  devActions: { gap: 10 },
  devBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 11, borderRadius: 12,
  },
  devBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  contactList: { gap: 8 },
  contactRow: { alignItems: "center", gap: 8 },
  contactText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  version: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
