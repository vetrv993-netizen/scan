import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { Language } from "@/constants/translations";
import type { AIModel } from "@/types/nutrition";

const AI_MODELS: AIModel[] = ["auto", "openai", "gemini", "claude"];

export default function SettingsScreen() {
  const colors = useColors();
  const {
    t,
    isRTL,
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    isDark,
    aiModel,
    setAiModel,
    clearHistory,
  } = useApp();
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleClearHistory = () => {
    Alert.alert(
      t.settings.clearHistory,
      t.settings.confirmClear,
      [
        { text: t.settings.no, style: "cancel" },
        {
          text: t.settings.yes,
          style: "destructive",
          onPress: clearHistory,
        },
      ]
    );
  };

  const handleCall = () => {
    Linking.openURL(`tel:${t.settings.developerPhone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${t.settings.developerEmail}`);
  };

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
      <Text
        style={[
          styles.title,
          { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {t.settings.title}
      </Text>

      {/* Language */}
      <SettingsSection title={t.settings.language} isRTL={isRTL} colors={colors}>
        <View style={[styles.optionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {(["ar", "en"] as Language[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.optionChip,
                {
                  backgroundColor:
                    language === lang ? colors.primary : colors.card,
                  borderColor:
                    language === lang ? colors.primary : colors.border,
                  flex: 1,
                },
              ]}
              onPress={() => setLanguage(lang)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      language === lang
                        ? colors.primaryForeground
                        : colors.foreground,
                    textAlign: "center",
                  },
                ]}
              >
                {lang === "ar" ? t.settings.arabic : t.settings.english}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title={t.settings.appearance} isRTL={isRTL} colors={colors}>
        <View style={[styles.optionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {(["light", "dark", "system"] as const).map((mode) => {
            const label =
              mode === "light"
                ? t.settings.lightMode
                : mode === "dark"
                  ? t.settings.darkMode
                  : t.settings.systemDefault;
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      themeMode === mode ? colors.primary : colors.card,
                    borderColor:
                      themeMode === mode ? colors.primary : colors.border,
                    flex: 1,
                  },
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        themeMode === mode
                          ? colors.primaryForeground
                          : colors.foreground,
                      textAlign: "center",
                      fontSize: 12,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SettingsSection>

      {/* AI Model */}
      <SettingsSection title={t.settings.aiModel} isRTL={isRTL} colors={colors}>
        {AI_MODELS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.radioRow,
              {
                backgroundColor: aiModel === m ? colors.primary + "10" : "transparent",
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
                <View
                  style={[styles.radioInner, { backgroundColor: colors.primary }]}
                />
              )}
            </View>
            <View style={[styles.radioContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
              <Text style={[styles.radioLabel, { color: colors.foreground }]}>
                {t.analyze.models[m]}
              </Text>
              {m === "auto" && (
                <Text style={[styles.radioHint, { color: colors.mutedForeground }]}>
                  {isRTL ? "يجرب جميع النماذج تلقائياً" : "Tries all models automatically"}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </SettingsSection>

      {/* Data */}
      <SettingsSection title={t.settings.data} isRTL={isRTL} colors={colors}>
        <TouchableOpacity
          style={[
            styles.actionRow,
            {
              backgroundColor: colors.destructive + "10",
              borderColor: colors.destructive + "30",
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
          onPress={handleClearHistory}
        >
          <Feather name="trash-2" size={18} color={colors.destructive} />
          <View style={[styles.actionContent, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
            <Text style={[styles.actionLabel, { color: colors.destructive }]}>
              {t.settings.clearHistory}
            </Text>
            <Text style={[styles.actionHint, { color: colors.mutedForeground }]}>
              {t.settings.clearHistoryDesc}
            </Text>
          </View>
        </TouchableOpacity>
      </SettingsSection>

      {/* Developer */}
      <SettingsSection title={t.settings.developer} isRTL={isRTL} colors={colors}>
        <View style={[styles.devCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.devHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.devAvatar, { backgroundColor: colors.primary }]}>
              <Feather name="user" size={24} color="#FFFFFF" />
            </View>
            <View style={[styles.devInfo, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
              <Text style={[styles.devName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                {t.settings.developerName}
              </Text>
              <Text style={[styles.devRole, { color: colors.mutedForeground }]}>
                {isRTL ? "مطور ومصمم التطبيق" : "App Developer & Designer"}
              </Text>
            </View>
          </View>
          <View style={[styles.devActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handleCall}
            >
              <Feather name="phone" size={16} color="#FFFFFF" />
              <Text style={styles.devBtnText}>{t.settings.call}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.devBtn,
                {
                  backgroundColor: colors.secondary,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flex: 1,
                },
              ]}
              onPress={handleEmail}
            >
              <Feather name="mail" size={16} color={colors.primary} />
              <Text style={[styles.devBtnText, { color: colors.primary }]}>
                {t.settings.email}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactInfo}>
            <View style={[styles.contactRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Feather name="phone" size={13} color={colors.mutedForeground} />
              <Text style={[styles.contactText, { color: colors.mutedForeground }]}>
                {t.settings.developerPhone}
              </Text>
            </View>
            <View style={[styles.contactRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Feather name="mail" size={13} color={colors.mutedForeground} />
              <Text style={[styles.contactText, { color: colors.mutedForeground }]}>
                {t.settings.developerEmail}
              </Text>
            </View>
          </View>
        </View>
      </SettingsSection>

      {/* Version */}
      <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
        {t.settings.version} 1.0.0 · Smart Nutrition AI
      </Text>
    </ScrollView>
  );
}

function SettingsSection({
  title,
  children,
  isRTL,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  isRTL: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      <View style={[styles.sectionBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionBody: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
    gap: 10,
  },
  optionRow: {
    gap: 8,
  },
  optionChip: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioContent: {
    flex: 1,
    gap: 2,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  radioHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  actionHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  devCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  devHeader: {
    alignItems: "center",
    gap: 14,
  },
  devAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  devInfo: {
    flex: 1,
    gap: 3,
  },
  devName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  devRole: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  devActions: {
    gap: 10,
  },
  devBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
  },
  devBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  contactInfo: {
    gap: 6,
  },
  contactRow: {
    alignItems: "center",
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  versionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
});
