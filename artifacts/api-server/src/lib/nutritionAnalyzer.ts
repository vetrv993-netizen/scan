import { openai } from "@workspace/integrations-openai-ai-server";
import { ai as geminiAi } from "@workspace/integrations-gemini-ai";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "./logger";

export type AIModel = "auto" | "openai" | "gemini" | "claude";

const NUTRITION_PROMPT = `You are an expert nutritionist and food scientist. Carefully analyze the food visible in this image.

Return ONLY a valid JSON object with this EXACT structure. No markdown, no code blocks, no explanation — pure JSON only:

{
  "foodName": { "en": "Food name in English", "ar": "اسم الطعام بالعربية" },
  "description": { "en": "1-2 sentence description in English", "ar": "وصف مختصر بالعربية" },
  "servingSize": "standard serving size (e.g. 1 cup / 200g / 1 medium piece)",
  "calories": 250,
  "macros": {
    "protein": 10.5,
    "fat": 8.2,
    "saturatedFat": 3.1,
    "carbohydrates": 35.0,
    "sugar": 5.2,
    "fiber": 3.0
  },
  "minerals": {
    "sodium": 450,
    "calcium": 120,
    "iron": 2.5
  },
  "vitamins": ["Vitamin C", "Vitamin B12", "Vitamin A"],
  "healthScore": 72,
  "imageQuality": "clear",
  "isEstimated": false,
  "healthBenefits": {
    "en": "Detailed health benefits in 2-3 sentences covering energy, nutrients, and body systems.",
    "ar": "فوائد صحية تفصيلية في جملتين أو ثلاث تتناول الطاقة والمغذيات وأجهزة الجسم."
  },
  "healthCautions": {
    "en": "Who should limit this and why — 1-2 clear sentences.",
    "ar": "من يجب أن يحد من تناوله ولماذا — جملة أو جملتان واضحتان."
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
- calories: kcal as number
- protein, fat, saturatedFat, carbohydrates, sugar, fiber: grams as numbers
- sodium, calcium, iron: milligrams as numbers
- healthScore: 0-100 (100 = whole unprocessed superfood, 0 = ultra-processed junk)
- imageQuality: "clear" | "blurry" | "unclear"
- isEstimated: true only when image quality prevents accurate analysis
- warnings.allergies: array like ["gluten", "dairy", "nuts", "shellfish", "eggs", "soy"]
- Set warning flags true when food significantly impacts those conditions
- Arabic text must be natural, fluent Modern Standard Arabic
- Return ONLY the JSON. No surrounding text whatsoever.`;

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

function extractJson(text: string): NutritionData {
  const cleaned = text.trim();
  // Try direct parse first
  try {
    return JSON.parse(cleaned) as NutritionData;
  } catch {
    // Try extracting JSON object from text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
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
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          { type: "text", text: NUTRITION_PROMPT },
        ],
      },
    ],
  });
  const text = response.choices[0]?.message?.content ?? "";
  return extractJson(text);
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
  const text = response.text ?? "";
  return extractJson(text);
}

async function analyzeWithClaude(imageBase64: string): Promise<NutritionData> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          { type: "text", text: NUTRITION_PROMPT },
        ],
      },
    ],
  });
  const block = response.content[0];
  const text = block.type === "text" ? block.text : "";
  return extractJson(text);
}

type ModelName = "openai" | "gemini" | "claude";

function getModelOrder(preferred: AIModel): ModelName[] {
  const all: ModelName[] = ["openai", "gemini", "claude"];
  if (preferred === "auto") return all;
  return [preferred as ModelName, ...all.filter((m) => m !== preferred)];
}

export async function analyzeNutrition(
  imageBase64: string,
  preferredModel: AIModel = "auto"
): Promise<{ data: NutritionData; modelUsed: string }> {
  const modelOrder = getModelOrder(preferredModel);

  for (const model of modelOrder) {
    try {
      logger.info({ model }, "Attempting nutrition analysis");
      let data: NutritionData;

      if (model === "openai") {
        data = await analyzeWithOpenAI(imageBase64);
      } else if (model === "gemini") {
        data = await analyzeWithGemini(imageBase64);
      } else {
        data = await analyzeWithClaude(imageBase64);
      }

      logger.info({ model }, "Nutrition analysis succeeded");
      return { data, modelUsed: model };
    } catch (err) {
      logger.warn({ model, err }, "Model failed, trying next");
    }
  }

  throw new Error("All AI models failed to analyze the image");
}
