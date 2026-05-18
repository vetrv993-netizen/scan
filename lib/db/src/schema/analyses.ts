import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export interface NutritionData {
  foodName: { en: string; ar: string };
  description: { en: string; ar: string };
  servingSize: string;
  calories: number;
  macros: {
    protein: number;
    fat: number;
    saturatedFat: number;
    carbohydrates: number;
    sugar: number;
    fiber: number;
  };
  minerals: {
    sodium: number;
    calcium: number;
    iron: number;
  };
  vitamins: string[];
  healthScore: number;
  imageQuality: string;
  isEstimated: boolean;
  healthBenefits: { en: string; ar: string };
  healthCautions: { en: string; ar: string };
  warnings: {
    diabetes: boolean;
    bloodPressure: boolean;
    allergies: string[];
    kidney: boolean;
    lowCarb: boolean;
    glutenSensitivity: boolean;
    lactoseIntolerance: boolean;
    highFat: boolean;
    highSugar: boolean;
  };
}

export const analysesTable = pgTable("analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageThumb: text("image_thumb"),
  nutritionData: jsonb("nutrition_data").notNull().$type<NutritionData>(),
  modelUsed: text("model_used").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Analysis = typeof analysesTable.$inferSelect;
export type InsertAnalysis = typeof analysesTable.$inferInsert;
