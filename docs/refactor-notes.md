# Policy-Driven Maternity Leave Calculator Refactor Notes

This document summarizes the refactor work completed to align the codebase with the PRD in `prd_maternity_calc.txt`, specifically Milestones A and B.

## Milestone A: Modular refactor foundation

### What was done
- Extracted calculator logic into pure, testable modules under `client/src/domain/calculator`.
- Centralized domain types in `client/src/domain/types/index.ts`.
- Wired the UI to call `calculateMaternityLeave()` and removed inline calculation logic from the page.
- Added unit tests for defaults, cap application, and waiting-period handling.

### Files added/updated
- `client/src/domain/calculator/calculateMaternityLeave.ts`
- `client/src/domain/calculator/resolveScenario.ts`
- `client/src/domain/calculator/validateAndApplyCaps.ts`
- `client/src/domain/calculator/computeLeaveBreakdown.ts`
- `client/src/domain/calculator/buildExplanation.ts`
- `client/src/domain/types/index.ts`
- `client/src/domain/calculator/calculateMaternityLeave.test.ts`
- `vitest.config.ts`
- `package.json` (added `test` script + `vitest` devDependency)

## Milestone B: US policy layer

### What was done
- Added policy configuration types and registry helpers.
- Implemented `US-GENERIC` fallback policy plus a `US-CA` policy.
- Applied defaults/caps/adjustments in the calculator pipeline.
- Updated UI to show assumptions, caps/adjustments, and warnings.
- Simplified the calculator flow to a two-step input + results view that surfaces the policy-driven explanation.

### Files added/updated
- `client/src/domain/policies/types.ts`
- `client/src/domain/policies/us-generic.ts`
- `client/src/domain/policies/us-ca.ts`
- `client/src/domain/policies/index.ts`
- `client/src/pages/Calculator.tsx`
- `client/src/components/ResultCharts.tsx`
- `client/src/lib/analytics.ts`

## Behavior changes and UI notes
- State/jurisdiction selection now drives defaults and caps.
- The results view includes explicit assumptions, caps applied, warnings, and double-check prompts.
- Charts now compare weekly income vs weekly benefit (policy output) instead of expense-focused scenarios.

## Testing

Run unit tests:

```bash
npm test
```

## Known gaps (intentionally deferred)
- LLM narration is optional and requires an API key plus env flag to enable.
- Only `US-GENERIC` and `US-CA` are defined; additional states need configs.
- Start date is collected but not used for timeline rendering.

## Milestone C: LLM narration (implemented)

### What was done
- Added a narration feature flag with local storage override.
- Implemented narration preparation, LLM call, validation, and safety fallback.
- Added UI toggle and display for the AI explanation.
- Narration calls now route through `/api/narration` to keep keys server-side.

### Files added/updated
- `client/src/lib/featureFlags.ts`
- `client/src/domain/narration/types.ts`
- `client/src/domain/narration/prepareNarrationInput.ts`
- `client/src/domain/narration/callNarrationLLM.ts`
- `client/src/domain/narration/validateNarration.ts`
- `client/src/domain/narration/enhanceWithNarration.ts`
- `client/src/components/NarrationToggle.tsx`
- `client/src/components/NarrationDisplay.tsx`
- `client/src/pages/Calculator.tsx`
- `.env.local`

## Next steps (suggested)
- Add another state policy (NY) and expand caps/eligibility coverage.
- Expand tests to cover explanation formatting and end-to-end scenarios.

## LLM environment setup
- `HUGGINGFACE_API_KEY` (or `HF_API_KEY`) is required on the server to enable narration calls.
- `HF_MODEL_ID` (or `HUGGINGFACE_MODEL`) overrides the default model.
- `VITE_ENABLE_LLM_NARRATION=true` turns the UI toggle on by default.
- The server now falls back to in-memory plan storage if `DATABASE_URL` is not set.

## Vercel deployment checklist
- Set `HUGGINGFACE_API_KEY` and `HF_MODEL_ID` in Vercel project environment variables.
- Set `VITE_ENABLE_LLM_NARRATION=true` if you want narration enabled by default.
- Keep `NODE_ENV=production` to ensure debug errors are not returned to the client.

---

## Milestone D: Baby product cost enrichment

### What was done
- Added a `baby_product_prices` DB table (one row per product category, upserted weekly).
- Server fetches live retail prices via Google Custom Search API on startup, then re-checks every 24 h; if data is > 7 days old it re-fetches.
- When no live price is available the server falls back to hardcoded national-average baselines.
- `GET /api/baby-costs?jurisdiction=<id>&leaveWeeks=<n>` returns per-category monthly estimates plus a total and a per-leave total.
- `BabyCostCard` component added to the Results step, gated behind the `babyCostEnrichment` feature flag.

### Files added/updated
- `shared/schema.ts` — `babyProductPrices` table
- `shared/routes.ts` — route definition + `BabyCostResponse` type
- `server/babyCosts/productQueries.ts` — canonical SKU queries + static fallbacks
- `server/babyCosts/googlePriceSearch.ts` — Google CSE fetch + multi-strategy price extraction
- `server/babyCosts/getCostEstimate.ts` — DB read with 7-day freshness check, falls back to static
- `server/babyCosts/weeklyRefresh.ts` — startup scheduler + 24 h interval
- `server/routes.ts` — registers `GET /api/baby-costs`, calls `schedulePriceRefresh()`
- `client/src/lib/featureFlags.ts` — `babyCostEnrichment` flag
- `client/src/hooks/use-baby-costs.ts` — React Query hook (24 h staleTime)
- `client/src/components/BabyCostCard.tsx` — card with per-line breakdown + source attribution
- `client/src/pages/Calculator.tsx` — wires `BabyCostCard` into `ResultsStep`

### How prices are communicated to the user
The `BabyCostCard` shows a small attribution line at the bottom:
- **Live prices**: "Prices from Google Shopping · updated \<date\>"
- **Static fallback**: "Based on national averages — enable Google CSE for live prices"

This means users always know whether they are seeing live retail data or estimates, without
needing a modal or extra screen.

### Google CSE API costs
| Tier | Queries/day | Monthly cost |
|---|---|---|
| Free | 100 | $0 |
| Paid overage | 101 + | $5 per 1,000 |

**This feature uses ~5 queries per week** (one per product category, refreshed weekly).
The free tier (100/day) will never be exceeded in normal operation.

### Local development setup
1. In `.env.local`, uncomment and fill in:
   ```
   GOOGLE_CSE_API_KEY=<your key>
   GOOGLE_CSE_ID=<your engine id>
   VITE_ENABLE_BABY_COSTS=true
   ```
2. Run `npm run db:push` to create the `baby_product_prices` table.
3. Restart the dev server — prices are fetched in the background on startup.

To get credentials (~10 minutes, no billing required for free tier):
- **API key**: [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create credentials → API key. Then enable "Custom Search API" for the project.
- **Search engine ID**: [cse.google.com](https://programmablesearchengine.google.com) → New search engine → add `walmart.com`, `target.com`, `amazon.com` → copy "Search engine ID".

### Vercel deployment checklist
- Add `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_ID` in Vercel project → Settings → Environment Variables.
- Set `VITE_ENABLE_BABY_COSTS=true` to enable the card for all users (or omit to keep it off by default).
- `DATABASE_URL` must be set; without it the server skips DB writes and returns static-fallback estimates only.
