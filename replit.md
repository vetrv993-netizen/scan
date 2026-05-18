# Smart Nutrition AI Analyzer

A production-ready mobile app (Expo/React Native) that analyzes food images using multi-AI models and generates bilingual (Arabic/English) nutrition reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite libs (integrations, db, api-zod)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env (auto-provisioned by Replit integrations): `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 54 / React Native 0.81 (expo-router v6)
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM (`analyses` table)
- AI: OpenAI GPT-5.4 → Google Gemini 3 Flash → Claude Sonnet 4.6 (multi-model fallback)
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/analyses.ts` — DB schema for nutrition analyses
- `artifacts/api-server/src/lib/nutritionAnalyzer.ts` — multi-AI fallback logic
- `artifacts/api-server/src/routes/nutrition/index.ts` — nutrition API routes
- `artifacts/mobile/context/AppContext.tsx` — global state (language, theme, history)
- `artifacts/mobile/constants/translations.ts` — Arabic/English strings
- `artifacts/mobile/constants/colors.ts` — green health theme (light + dark)

## Architecture decisions

- Multi-AI fallback: tries preferred model first, then falls back through remaining models — ensures high availability
- Backend-for-AI: all AI calls made server-side to keep API keys secure; only results returned to mobile
- Local history: analysis results saved in AsyncStorage on device + PostgreSQL server-side
- Bilingual design: all content has `.en` and `.ar` fields; RTL layout achieved via `textAlign` and `flexDirection` based on language context
- 50MB body limit on Express to handle base64-encoded food images

## Product

- Food image upload or camera capture
- AI-powered nutrition analysis (calories, protein, fat, carbs, fiber, sugar, sodium, calcium, iron, vitamins)
- Health score (0-100), health benefits, health cautions, special warnings (diabetes, blood pressure, allergies, etc.)
- Full Arabic/English bilingual support with RTL layout
- Dark/light/system theme
- Analysis history (stored locally + in DB)
- Settings with developer info (Dr. Abdul Quddus Abbad, +967770464353, vetrv993@gmail.com)

## User preferences

- Arabic is the default language
- Developer info: Dr. Abdul Quddus Abbad, +967770464353, vetrv993@gmail.com
- Green health theme (#2E7D32 light, #66BB6A dark)

## Gotchas

- `@google/genai` requires build scripts — must be in `onlyBuiltDependencies` in pnpm-workspace.yaml
- `@google/genai` and `@anthropic-ai/sdk` must be direct dependencies of `api-server` (not just transitive) because esbuild externalizes `@google/*` patterns and they need to be findable at runtime
- The api-server body limit is 50MB to accommodate base64 images
- Run `pnpm run typecheck:libs` before `codegen` to ensure integration libs compile
- Use `zod` (not `zod/v4`) in api-server routes — esbuild can't resolve the subpath export

## Pointers

- See `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `lib/api-spec/openapi.yaml` for the complete API contract
