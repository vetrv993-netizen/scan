import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
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

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert(
            isRTL ? "تحتاج إلى إذن الكاميرا" : "Camera Permission Required",
            isRTL
              ? "يرجى السماح للتطبيق باستخدام الكاميرا"
              : "Please allow camera access to take photos"
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          quality: 0.8,
          base64: true,
          exif: false,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert(
            isRTL ? "تحتاج إلى إذن المعرض" : "Gallery Permission Required",
            isRTL
              ? "يرجى السماح للتطبيق بالوصول إلى الصور"
              : "Please allow photo library access"
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          quality: 0.8,
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
    } catch (err) {
      Alert.alert(t.common.error, t.common.retry);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === "web") {
      handlePickImage(false);
      return;
    }
    Alert.alert(
      isRTL ? "اختر مصدر الصورة" : "Choose Image Source",
      undefined,
      [
        {
          text: t.analyze.takePhoto,
          onPress: () => handlePickImage(true),
        },
        {
          text: t.analyze.chooseGallery,
          onPress: () => handlePickImage(false),
        },
        {
          text: t.common.close,
          style: "cancel",
        },
      ]
    );
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
        body: JSON.stringify({
          imageBase64,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Analysis failed");
      }

      const result = await response.json() as StoredAnalysis;

      // Store locally with image URI for display
      const localAnalysis: StoredAnalysis = {
        ...result,
        imageUri: imageUri ?? undefined,
      };

      addAnalysis(localAnalysis);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      router.push({
        pathname: "/result/[id]",
        params: { id: result.id },
      });

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPadding + 16,
        paddingBottom: bottomPadding + 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: colors.foreground,
            textAlign: isRTL ? "right" : "left",
          },
        ]}
      >
        {t.analyze.title}
      </Text>

      {/* Image upload area */}
      <TouchableOpacity
        style={[
          styles.uploadArea,
          {
            backgroundColor: colors.card,
            borderColor: imageUri ? colors.primary : colors.border,
            borderStyle: imageUri ? "solid" : "dashed",
          },
        ]}
        onPress={showImageOptions}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <View style={styles.previewWrapper}>
            <Image
              source={{ uri: imageUri }}
              style={styles.preview}
              resizeMode="cover"
            />
            <View
              style={[
                styles.changeOverlay,
                { backgroundColor: "rgba(0,0,0,0.4)" },
              ]}
            >
              <Feather name="camera" size={22} color="#FFFFFF" />
              <Text style={styles.changeText}>{t.analyze.changeImage}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <View
              style={[
                styles.uploadIcon,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Feather name="image" size={32} color={colors.primary} />
            </View>
            <Text
              style={[
                styles.uploadText,
                { color: colors.foreground },
              ]}
            >
              {t.analyze.uploadArea}
            </Text>
            <Text
              style={[styles.uploadHint, { color: colors.mutedForeground }]}
            >
              {t.analyze.uploadHint}
            </Text>
            <View style={[styles.btnRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={[
                    styles.miniBtn,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => handlePickImage(true)}
                >
                  <Feather name="camera" size={14} color="#FFFFFF" />
                  <Text style={styles.miniBtnText}>{t.analyze.takePhoto}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.miniBtn,
                  { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={() => handlePickImage(false)}
              >
                <Feather name="image" size={14} color={colors.primary} />
                <Text style={[styles.miniBtnText, { color: colors.primary }]}>
                  {t.analyze.chooseGallery}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* AI Model selector */}
      <Text
        style={[
          styles.modelLabel,
          { color: colors.foreground, textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {t.analyze.modelLabel}
      </Text>
      <View style={[styles.modelRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {MODEL_OPTIONS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.modelChip,
              {
                backgroundColor:
                  selectedModel === m ? colors.primary : colors.card,
                borderColor:
                  selectedModel === m ? colors.primary : colors.border,
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
                {
                  color:
                    selectedModel === m
                      ? colors.primaryForeground
                      : colors.foreground,
                },
              ]}
            >
              {t.analyze.models[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tips */}
      <View
        style={[
          styles.tipsBox,
          { backgroundColor: colors.info + "10", borderColor: colors.info + "30" },
        ]}
      >
        <Feather name="info" size={14} color={colors.info} />
        <Text
          style={[
            styles.tipsText,
            { color: colors.info, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {t.analyze.tips}
        </Text>
      </View>

      {/* Analyze button */}
      <TouchableOpacity
        style={[
          styles.analyzeBtn,
          {
            backgroundColor: imageUri ? colors.primary : colors.muted,
            opacity: imageUri ? 1 : 0.6,
          },
        ]}
        onPress={handleAnalyze}
        disabled={!imageBase64}
        activeOpacity={0.85}
      >
        <Feather name="zap" size={20} color={imageUri ? "#FFFFFF" : colors.mutedForeground} />
        <Text
          style={[
            styles.analyzeBtnText,
            { color: imageUri ? "#FFFFFF" : colors.mutedForeground },
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
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  uploadArea: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
    marginBottom: 24,
    minHeight: 220,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    minHeight: 220,
  },
  uploadIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  uploadHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  btnRow: {
    gap: 10,
    marginTop: 4,
  },
  miniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  miniBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
  },
  previewWrapper: {
    height: 260,
    position: "relative",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  changeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  changeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  modelLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
  },
  modelRow: {
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  modelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modelChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  tipsBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  tipsText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
  },
  analyzeBtnText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
});
