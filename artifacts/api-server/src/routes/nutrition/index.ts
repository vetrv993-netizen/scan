import { Router, type IRouter } from "express";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db, analysesTable } from "@workspace/db";
import { analyzeNutrition, type AIModel } from "../../lib/nutritionAnalyzer";

const router: IRouter = Router();

const AnalyzeRequestSchema = z.object({
  imageBase64: z.string().min(1, "imageBase64 is required"),
  model: z.enum(["auto", "openai", "gemini", "claude"]).default("auto"),
});

router.post("/nutrition/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { imageBase64, model } = parsed.data;

  try {
    const { data, modelUsed } = await analyzeNutrition(imageBase64, model as AIModel);

    // Store only first 200 chars of base64 as thumb reference
    const imageThumb = imageBase64.substring(0, 200);

    const [analysis] = await db
      .insert(analysesTable)
      .values({
        nutritionData: data,
        modelUsed,
        imageThumb,
      })
      .returning();

    res.json(analysis);
  } catch (err) {
    req.log.error({ err }, "Nutrition analysis failed");
    res.status(422).json({ error: "Failed to analyze image. Please try a clearer photo." });
  }
});

router.get("/nutrition/analyses", async (_req, res): Promise<void> => {
  const analyses = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.createdAt))
    .limit(100);

  res.json(analyses);
});

router.delete("/nutrition/analyses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [deleted] = await db
    .delete(analysesTable)
    .where(eq(analysesTable.id, raw))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
