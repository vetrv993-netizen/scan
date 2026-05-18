export type AIModel = "auto" | "openai" | "gemini" | "claude";

export interface BilingualText {
  en: string;
  ar: string;
}

export interface NutritionMacros {
  protein: number;
  fat: number;
  saturatedFat: number;
  carbohydrates: number;
  sugar: number;
  fiber: number;
}

export interface NutritionMinerals {
  sodium: number;
  calcium: number;
  iron: number;
}

export interface NutritionWarnings {
  diabetes: boolean;
  bloodPressure: boolean;
  allergies: string[];
  kidney: boolean;
  lowCarb: boolean;
  glutenSensitivity: boolean;
  lactoseIntolerance: boolean;
  highFat: boolean;
  highSugar: boolean;
}

export interface NutritionData {
  foodName: BilingualText;
  description: BilingualText;
  servingSize: string;
  calories: number;
  macros: NutritionMacros;
  minerals: NutritionMinerals;
  vitamins: string[];
  healthScore: number;
  imageQuality: string;
  isEstimated: boolean;
  healthBenefits: BilingualText;
  healthCautions: BilingualText;
  warnings: NutritionWarnings;
}

export interface StoredAnalysis {
  id: string;
  nutritionData: NutritionData;
  modelUsed: string;
  imageThumb?: string | null;
  createdAt: string;
  imageUri?: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbohydrates: number;
  sugar: number;
  fiber: number;
  sodium: number;
  calcium: number;
  iron: number;
  healthScore: number;
  vitamins: string[];
}

export interface SavedMeal {
  id: string;
  name: string;
  items: StoredAnalysis[];
  totals: NutritionTotals;
  createdAt: string;
}

export function computeMealTotals(items: StoredAnalysis[]): NutritionTotals {
  if (items.length === 0) {
    return {
      calories: 0, protein: 0, fat: 0, saturatedFat: 0,
      carbohydrates: 0, sugar: 0, fiber: 0,
      sodium: 0, calcium: 0, iron: 0,
      healthScore: 0, vitamins: [],
    };
  }
  return {
    calories: Math.round(items.reduce((s, a) => s + a.nutritionData.calories, 0)),
    protein: parseFloat(items.reduce((s, a) => s + a.nutritionData.macros.protein, 0).toFixed(1)),
    fat: parseFloat(items.reduce((s, a) => s + a.nutritionData.macros.fat, 0).toFixed(1)),
    saturatedFat: parseFloat(items.reduce((s, a) => s + a.nutritionData.macros.saturatedFat, 0).toFixed(1)),
    carbohydrates: parseFloat(items.reduce((s, a) => s + a.nutritionData.macros.carbohydrates, 0).toFixed(1)),
    sugar: parseFloat(items.reduce((s, a) => s + a.nutritionData.macros.sugar, 0).toFixed(1)),
    fiber: parseFloat(items.reduce((s, a) => s + a.nutritionData.macros.fiber, 0).toFixed(1)),
    sodium: Math.round(items.reduce((s, a) => s + a.nutritionData.minerals.sodium, 0)),
    calcium: Math.round(items.reduce((s, a) => s + a.nutritionData.minerals.calcium, 0)),
    iron: parseFloat(items.reduce((s, a) => s + a.nutritionData.minerals.iron, 0).toFixed(1)),
    healthScore: Math.round(
      items.reduce((s, a) => s + a.nutritionData.healthScore, 0) / items.length
    ),
    vitamins: [...new Set(items.flatMap((a) => a.nutritionData.vitamins))],
  };
}
