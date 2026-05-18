import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import type { AIModel, StoredAnalysis } from "@/types/nutrition";

const MODEL_OPTIONS: AIModel[] = ["auto", "openai", "gemini", "claude"];

export default function AnalyzeScreen() {
  const colors = useColors();
  const { t, isRTL, aiModel, setAiModel, addAnalysis } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModel);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedAnim = useRef(new Animated.Value(0)).current;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleAdvanced = () => {
    const next = !showAdvanced;
    setShowAdvanced(next);
    Animated.timing(advancedAnim, {
      toValue: next ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
    Haptics.selectionAsync();
  };

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert(
            isRTL ? "تحتاج إلى إذن الكاميرا" : "Camera Permission Required",
            isRTL ? "يرجى السماح للتطبيق باستخدام الكاميرا" : "Please allow camera access"
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          quality: 0.85,
          base64: true,
          exif: false,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert(
            isRTL ? "تحتاج إلى إذن المعرض" : "Gallery Permission Required",
            isRTL ? "يرجى السماح للتطبيق بالوصول إلى الصور" : "Please allow photo library access"
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          quality: 0.85,
          base64: true,
          exif: false,
        });
      }
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ?? null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      Alert.alert(t.common.error, t.common.retry);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const baseUrl = domain ? `https://${domain}` : "";

      const response = await fetch(`${baseUrl}/api/nutrition/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, model: selectedModel }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Analysis failed");
      }

      const result = await response.json() as StoredAnalysis;
      const localAnalysis: StoredAnalysis = { ...result, imageUri: imageUri ?? undefined };

      addAnalysis(localAnalysis);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      router.push({ pathname: "/result/[id]", params: { id: result.id } });
      setImageUri(null);
      setImageBase64(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.analyze.errorMsg;
      Alert.alert(t.analyze.errorTitle, msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <LoadingAnalysis stages={t.analyze.stages} isRTL={isRTL} />;
  }

  const advancedMaxHeight = advancedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPadding + 20,
        paddingBottom: bottomPadding + 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Text style={[styles.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
        {t.analyze.title}
      </Text>

      {/* Image area */}
      <View
        style={[
          styles.uploadArea,
          {
            backgroundColor: colors.card,
            borderColor: imageUri ? colors.primary : colors.border,
            borderStyle: imageUri ? "solid" : "dashed",
            shadowColor: colors.shadow,
          },
        ]}
      >
        {imageUri ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <View style={styles.previewOverlay}>
              <TouchableOpacity
                style={[styles.changeBtn, { backgroundColor: colors.primary }]}
                onPress={() => handlePickImage(false)}
              >
                <Feather name="image" size={14} color={colors.primaryForeground} />
                <Text style={[styles.changeBtnText, { color: colors.primaryForeground }]}>
                  {t.analyze.changeImage}
                </Text>
              </TouchableOpacity>
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={[styles.changeBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}
                  onPress={() => handlePickImage(true)}
                >
                  <Feather name="camera" size={14} color="#FFFFFF" />
                  <Text style={[styles.changeBtnText, { color: "#FFFFFF" }]}>
                    {t.analyze.takePhoto}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <View style={[styles.uploadIconBox, { backgroundColor: colors.primary + "14" }]}>
              <Feather name="camera" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.uploadText, { color: colors.foreground }]}>
              {t.analyze.uploadArea}
            </Text>
            <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>
              {t.analyze.uploadSub}
            </Text>
            <View style={[styles.uploadBtnRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handlePickImage(true)}
                >
                  <Feather name="camera" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.uploadBtnText, { color: colors.primaryForeground }]}>
                    {t.analyze.takePhoto}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={() => handlePickImage(false)}
              >
                <Feather name="image" size={16} color={colors.primary} />
                <Text style={[styles.uploadBtnText, { color: colors.primary }]}>
                  {t.analyze.chooseGallery}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Advanced settings (collapsed by default) */}
      <TouchableOpacity
        style={[
          styles.advancedToggle,
          {
            backgroundColor: colors.muted,
            borderColor: colors.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
        onPress={toggleAdvanced}
        activeOpacity={0.7}
      >
        <View style={[styles.advancedLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Feather name="sliders" size={16} color={colors.mutedForeground} />
          <Text style={[styles.advancedLabel, { color: colors.mutedForeground }]}>
            {t.analyze.advanced}
          </Text>
          <View
            style={[
              styles.modelBadge,
              { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" },
            ]}
          >
            <Text style={[styles.modelBadgeText, { color: colors.primary }]}>
              {t.analyze.models[selectedModel]}
            </Text>
          </View>
        </View>
        <Feather
          name={showAdvanced ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.advancedPanel,
          {
            maxHeight: advancedMaxHeight,
            overflow: "hidden",
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.aiModelLabel,
            { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {t.analyze.aiModelLabel}
        </Text>
        <View style={[styles.modelGrid, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {MODEL_OPTIONS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modelChip,
                {
                  backgroundColor: selectedModel === m ? colors.primary : colors.muted,
                  borderColor: selectedModel === m ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                setSelectedModel(m);
                setAiModel(m);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[
                  styles.modelChipText,
                  { color: selectedModel === m ? colors.primaryForeground : colors.mutedForeground },
                ]}
                numberOfLines={2}
              >
                {t.analyze.models[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Tips */}
      <View
        style={[
          styles.tipsRow,
          {
            backgroundColor: colors.info + "0E",
            borderColor: colors.info + "25",
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Feather name="info" size={13} color={colors.info} />
        <Text style={[styles.tipsText, { color: colors.info, textAlign: isRTL ? "right" : "left" }]}>
          {t.analyze.tips}
        </Text>
      </View>

      {/* Analyze button */}
      <TouchableOpacity
        style={[
          styles.analyzeBtn,
          {
            backgroundColor: imageUri ? colors.primary : colors.muted,
            shadowColor: imageUri ? colors.primary : "transparent",
          },
        ]}
        onPress={handleAnalyze}
        disabled={!imageBase64}
        activeOpacity={0.85}
      >
        <Feather
          name="zap"
          size={20}
          color={imageUri ? colors.primaryForeground : colors.mutedForeground}
        />
        <Text
          style={[
            styles.analyzeBtnText,
            { color: imageUri ? colors.primaryForeground : colors.mutedForeground },
          ]}
        >
          {t.analyze.analyzeBtn}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 20 },
  uploadArea: {
    borderRadius: 18, borderWidth: 2, overflow: "hidden",
    marginBottom: 14, minHeight: 230,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  uploadPlaceholder: {
    alignItems: "center", justifyContent: "center",
    padding: 28, gap: 12, minHeight: 230,
  },
  uploadIconBox: {
    width: 80, height: 80, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  uploadText: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  uploadSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  uploadBtnRow: { gap: 10, marginTop: 6 },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22,
  },
  uploadBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  previewWrapper: { height: 280, position: "relative" },
  preview: { width: "100%", height: "100%" },
  previewOverlay: {
    position: "absolute", bottom: 12, left: 12, right: 12,
    flexDirection: "row", gap: 8,
  },
  changeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  changeBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  advancedToggle: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 13, borderRadius: 13, borderWidth: 1, marginBottom: 8,
  },
  advancedLeft: { flex: 1, alignItems: "center", gap: 8 },
  advancedLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modelBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  modelBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  advancedPanel: {
    borderRadius: 13, borderWidth: 1, padding: 14, marginBottom: 14, gap: 12,
  },
  aiModelLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  modelGrid: { flexWrap: "wrap", gap: 8 },
  modelChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, minWidth: "45%",
  },
  modelChipText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  tipsRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 20,
  },
  tipsText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  analyzeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, borderRadius: 16, paddingVertical: 17,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  analyzeBtnText: { fontSize: 18, fontFamily: "Inter_700Bold" },
});
