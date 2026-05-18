import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { HistoryItem } from "@/components/HistoryItem";
import type { StoredAnalysis } from "@/types/nutrition";

export default function HistoryScreen() {
  const colors = useColors();
  const { t, isRTL, history, deleteAnalysis, clearHistory } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      isRTL ? "حذف التحليل" : "Delete Analysis",
      t.history.confirmDelete,
      [
        { text: t.history.no, style: "cancel" },
        { text: t.history.yes, style: "destructive", onPress: () => deleteAnalysis(id) },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      isRTL ? "مسح الكل" : "Clear All",
      t.history.confirmClear,
      [
        { text: t.history.no, style: "cancel" },
        { text: t.history.yes, style: "destructive", onPress: clearHistory },
      ]
    );
  };

  const renderItem = ({ item }: { item: StoredAnalysis }) => (
    <HistoryItem
      analysis={item}
      onPress={() => router.push({ pathname: "/result/[id]", params: { id: item.id } })}
      onDelete={() => handleDeleteItem(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 20,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>{t.history.title}</Text>
          {history.length > 0 && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {history.length} {isRTL ? "تحليل" : "analyses"}
            </Text>
          )}
        </View>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={[styles.clearBtn, { backgroundColor: colors.destructive + "14" }]}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
            <Text style={[styles.clearText, { color: colors.destructive }]}>
              {t.history.clearAll}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "14" }]}>
            <Feather name="clock" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {t.history.empty}
          </Text>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/analyze")}
          >
            <Feather name="camera" size={16} color={colors.primaryForeground} />
            <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
              {isRTL ? "ابدأ التحليل" : "Start Analyzing"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: bottomPadding + 100,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, justifyContent: "space-between", alignItems: "flex-end",
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  clearBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  clearText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  emptyContainer: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 18, paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  emptyText: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 26,
  },
  startBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 4,
  },
  startBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
