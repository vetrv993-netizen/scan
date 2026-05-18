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
import type { AIModel, StoredAnalysis, SavedMeal } from "@/types/nutrition";
import { computeMealTotals } from "@/types/nutrition";

export type ThemeMode = "light" | "dark" | "system";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  aiModel: AIModel;
  setAiModel: (model: AIModel) => void;
  // Analysis history
  history: StoredAnalysis[];
  addAnalysis: (analysis: StoredAnalysis) => void;
  deleteAnalysis: (id: string) => void;
  clearHistory: () => void;
  // Current meal builder
  currentMeal: StoredAnalysis[];
  addToMeal: (analysis: StoredAnalysis) => void;
  removeFromMeal: (id: string) => void;
  clearMeal: () => void;
  isInMeal: (id: string) => boolean;
  // Saved meals
  savedMeals: SavedMeal[];
  saveMeal: (name: string) => void;
  deleteSavedMeal: (id: string) => void;
  // i18n
  t: (typeof translations)["ar"];
  isRTL: boolean;
}

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: "app_language",
  THEME: "app_theme",
  AI_MODEL: "app_ai_model",
  HISTORY: "app_history",
  CURRENT_MEAL: "app_current_meal",
  SAVED_MEALS: "app_saved_meals",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>("ar");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [aiModel, setAiModelState] = useState<AIModel>("auto");
  const [history, setHistory] = useState<StoredAnalysis[]>([]);
  const [currentMeal, setCurrentMeal] = useState<StoredAnalysis[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [lang, theme, model, hist, meal, saved] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.AI_MODEL),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_MEAL),
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_MEALS),
        ]);
        if (lang) setLanguageState(lang as Language);
        if (theme) setThemeModeState(theme as ThemeMode);
        if (model) setAiModelState(model as AIModel);
        if (hist) setHistory(JSON.parse(hist) as StoredAnalysis[]);
        if (meal) setCurrentMeal(JSON.parse(meal) as StoredAnalysis[]);
        if (saved) setSavedMeals(JSON.parse(saved) as SavedMeal[]);
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

  // History
  const addAnalysis = useCallback((analysis: StoredAnalysis) => {
    setHistory((prev) => {
      const updated = [analysis, ...prev].slice(0, 100);
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

  // Meal builder
  const addToMeal = useCallback((analysis: StoredAnalysis) => {
    setCurrentMeal((prev) => {
      if (prev.some((a) => a.id === analysis.id)) return prev;
      const updated = [...prev, analysis];
      void AsyncStorage.setItem(STORAGE_KEYS.CURRENT_MEAL, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromMeal = useCallback((id: string) => {
    setCurrentMeal((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      void AsyncStorage.setItem(STORAGE_KEYS.CURRENT_MEAL, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearMeal = useCallback(() => {
    setCurrentMeal([]);
    void AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_MEAL);
  }, []);

  const isInMeal = useCallback(
    (id: string) => currentMeal.some((a) => a.id === id),
    [currentMeal]
  );

  // Saved meals
  const saveMeal = useCallback(
    (name: string) => {
      if (currentMeal.length === 0) return;
      const meal: SavedMeal = {
        id: Date.now().toString(),
        name,
        items: currentMeal,
        totals: computeMealTotals(currentMeal),
        createdAt: new Date().toISOString(),
      };
      setSavedMeals((prev) => {
        const updated = [meal, ...prev];
        void AsyncStorage.setItem(STORAGE_KEYS.SAVED_MEALS, JSON.stringify(updated));
        return updated;
      });
    },
    [currentMeal]
  );

  const deleteSavedMeal = useCallback((id: string) => {
    setSavedMeals((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      void AsyncStorage.setItem(STORAGE_KEYS.SAVED_MEALS, JSON.stringify(updated));
      return updated;
    });
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
        currentMeal,
        addToMeal,
        removeFromMeal,
        clearMeal,
        isInMeal,
        savedMeals,
        saveMeal,
        deleteSavedMeal,
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
