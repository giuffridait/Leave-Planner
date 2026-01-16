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
- Milestone C (LLM narration) is not implemented.
- Only `US-GENERIC` and `US-CA` are defined; additional states need configs.
- Start date is collected but not used for timeline rendering.

## Next steps (suggested)
- Add another state policy (NY) and expand caps/eligibility coverage.
- Implement LLM narration behind a feature flag with numeric allowlist validation.
- Expand tests to cover explanation formatting and end-to-end scenarios.
