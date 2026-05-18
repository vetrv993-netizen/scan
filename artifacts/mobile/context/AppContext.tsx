import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { translations, type Language } from "@/constants/translations";
import type { AIModel, StoredAnalysis } from "@/types/nutrition";

type ThemeMode = "light" | "dark" | "system";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  aiModel: AIModel;
  setAiModel: (model: AIModel) => void;
  history: StoredAnalysis[];
  addAnalysis: (analysis: StoredAnalysis) => void;
  deleteAnalysis: (id: string) => void;
  clearHistory: () => void;
  t: (typeof translations)["ar"];
  isRTL: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: "app_language",
  THEME: "app_theme",
  AI_MODEL: "app_ai_model",
  HISTORY: "app_history",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>("ar");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [aiModel, setAiModelState] = useState<AIModel>("auto");
  const [history, setHistory] = useState<StoredAnalysis[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [lang, theme, model, hist] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.AI_MODEL),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        ]);
        if (lang) setLanguageState(lang as Language);
        if (theme) setThemeModeState(theme as ThemeMode);
        if (model) setAiModelState(model as AIModel);
        if (hist) setHistory(JSON.parse(hist) as StoredAnalysis[]);
      } catch {
        // ignore storage errors
      } finally {
        setLoaded(true);
      }
    }
    void loadSettings();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    void AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    void AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
  }, []);

  const setAiModel = useCallback((model: AIModel) => {
    setAiModelState(model);
    void AsyncStorage.setItem(STORAGE_KEYS.AI_MODEL, model);
  }, []);

  const addAnalysis = useCallback((analysis: StoredAnalysis) => {
    setHistory((prev) => {
      const updated = [analysis, ...prev].slice(0, 50); // keep last 50
      void AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteAnalysis = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      void AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    void AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  }, []);

  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemScheme === "dark");

  const t = translations[language];
  const isRTL = language === "ar";

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        themeMode,
        setThemeMode,
        isDark,
        aiModel,
        setAiModel,
        history,
        addAnalysis,
        deleteAnalysis,
        clearHistory,
        t,
        isRTL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
