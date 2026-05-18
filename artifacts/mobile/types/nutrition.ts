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
  imageUri?: string; // local image URI (not persisted)
}
