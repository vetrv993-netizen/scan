import { openai } from "@workspace/integrations-openai-ai-server";
import { ai as geminiAi } from "@workspace/integrations-gemini-ai";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "./logger";

export type AIModel = "auto" | "openai" | "gemini" | "claude";

const NUTRITION_PROMPT = `You are an expert nutritionist and food scientist. Carefully analyze the food visible in this image.

Return ONLY a valid JSON object — no markdown, no code blocks, no preamble — pure JSON:

{
  "foodName": { "en": "Food name in English", "ar": "اسم الطعام بالعربية" },
  "description": { "en": "1-2 sentence description", "ar": "وصف مختصر" },
  "servingSize": "standard serving (e.g. 1 cup / 200g / 1 piece)",
  "calories": 250,
  "macros": {
    "protein": 10.5,
    "fat": 8.2,
    "saturatedFat": 3.1,
    "carbohydrates": 35.0,
    "sugar": 5.2,
    "fiber": 3.0
  },
  "minerals": { "sodium": 450, "calcium": 120, "iron": 2.5 },
  "vitamins": ["Vitamin C", "Vitamin B12"],
  "healthScore": 72,
  "imageQuality": "clear",
  "isEstimated": false,
  "healthBenefits": {
    "en": "Detailed health benefits in 2-3 sentences.",
    "ar": "فوائد صحية تفصيلية في جملتين أو ثلاث."
  },
  "healthCautions": {
    "en": "Who should limit this and why.",
    "ar": "من يجب أن يحد من تناوله ولماذا."
  },
  "warnings": {
    "diabetes": false,
    "bloodPressure": false,
    "allergies": [],
    "kidney": false,
    "lowCarb": false,
    "glutenSensitivity": false,
    "lactoseIntolerance": false,
    "highFat": false,
    "highSugar": false
  }
}

Rules:
- calories: kcal as number only
- protein, fat, saturatedFat, carbohydrates, sugar, fiber: grams as numbers
- sodium, calcium, iron: milligrams as numbers
- healthScore: 0-100 (100 = whole unprocessed superfood, 0 = ultra-processed)
- imageQuality: "clear" | "blurry" | "unclear"
- isEstimated: true only if image quality prevents precise analysis
- allergies: array like ["gluten", "dairy", "nuts", "shellfish", "eggs", "soy"]
- Set warning flags true when food significantly impacts those conditions
- Arabic must be natural fluent Modern Standard Arabic
- Return ONLY the JSON. Nothing else.`;

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

type ModelName = "openai" | "gemini" | "claude";

function extractJson(text: string): NutritionData {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned) as NutritionData;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    return JSON.parse(match[0]) as NutritionData;
  }
}

async function analyzeWithOpenAI(imageBase64: string): Promise<NutritionData> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: "text", text: NUTRITION_PROMPT },
        ],
      },
    ],
  });
  return extractJson(response.choices[0]?.message?.content ?? "");
}

async function analyzeWithGemini(imageBase64: string): Promise<NutritionData> {
  const response = await geminiAi.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg" as const, data: imageBase64 } },
          { text: NUTRITION_PROMPT },
        ],
      },
    ],
    config: { maxOutputTokens: 2048 },
  });
  return extractJson(response.text ?? "");
}

async function analyzeWithClaude(imageBase64: string): Promise<NutritionData> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
          { type: "text", text: NUTRITION_PROMPT },
        ],
      },
    ],
  });
  const block = response.content[0];
  return extractJson(block.type === "text" ? block.text : "");
}

async function analyzeWithModel(model: ModelName, imageBase64: string): Promise<NutritionData> {
  if (model === "openai") return analyzeWithOpenAI(imageBase64);
  if (model === "gemini") return analyzeWithGemini(imageBase64);
  return analyzeWithClaude(imageBase64);
}

function getModelOrder(preferred: AIModel): ModelName[] {
  const all: ModelName[] = ["openai", "gemini", "claude"];
  if (preferred === "auto") return all;
  return [preferred as ModelName, ...all.filter((m) => m !== preferred)];
}

const MODEL_TIMEOUT_MS = 35_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Model timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export async function analyzeNutrition(
  imageBase64: string,
  preferredModel: AIModel = "auto"
): Promise<{ data: NutritionData; modelUsed: string }> {
  if (preferredModel === "auto") {
    // Race all models in parallel — fastest valid response wins
    logger.info("Racing all AI models in parallel");
    const modelPromises = (["openai", "gemini", "claude"] as ModelName[]).map((model) =>
      withTimeout(analyzeWithModel(model, imageBase64), MODEL_TIMEOUT_MS)
        .then((data) => {
          logger.info({ model }, "Model responded first");
          return { data, modelUsed: model };
        })
        .catch((err) => {
          logger.warn({ model, err }, "Model failed in race");
          return Promise.reject(err);
        })
    );

    try {
      return await Promise.any(modelPromises);
    } catch {
      throw new Error("All AI models failed to analyze the image");
    }
  }

  // Specific model: try preferred first, then fall back
  const order = getModelOrder(preferredModel);
  for (const model of order) {
    try {
      logger.info({ model }, "Trying model");
      const data = await withTimeout(analyzeWithModel(model, imageBase64), MODEL_TIMEOUT_MS);
      logger.info({ model }, "Analysis succeeded");
      return { data, modelUsed: model };
    } catch (err) {
      logger.warn({ model, err }, "Model failed, trying next");
    }
  }

  throw new Error("All AI models failed to analyze the image");
}
