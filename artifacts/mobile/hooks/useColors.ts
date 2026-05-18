import { useContext } from "react";
import { useColorScheme } from "react-native";
import { AppContext } from "@/context/AppContext";
import colors from "@/constants/colors";

/**
 * Returns design tokens for the current theme mode.
 * Reads isDark from AppContext (respects user's Light/Dark/System choice).
 * Safely falls back to system color scheme when used outside AppProvider
 * (e.g. in ErrorFallback).
 */
export function useColors() {
  const ctx = useContext(AppContext);
  const systemScheme = useColorScheme();
  const isDark = ctx ? ctx.isDark : systemScheme === "dark";
  const palette = isDark ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
