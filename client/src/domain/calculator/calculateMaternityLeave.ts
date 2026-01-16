import type { CalculationOptions, CalculationResult, JurisdictionId, UserInputs } from "../types";
import { getPolicyConfig } from "../policies";
import { buildExplanation } from "./buildExplanation";
import { computeLeaveBreakdown } from "./computeLeaveBreakdown";
import { resolveScenario } from "./resolveScenario";
import { validateAndApplyCaps } from "./validateAndApplyCaps";

export function calculateMaternityLeave(
  inputs: UserInputs,
  jurisdiction: JurisdictionId,
  _options?: CalculationOptions,
): CalculationResult {
  const policy = getPolicyConfig(jurisdiction);
  const { scenario, assumptions } = resolveScenario(inputs, policy);
  const { validated, warnings, adjustments } = validateAndApplyCaps(scenario, policy);
  const breakdown = computeLeaveBreakdown(validated);
  const explanation = buildExplanation(breakdown, assumptions, warnings, adjustments);

  return {
    breakdown,
    explanation,
    metadata: {
      jurisdiction: policy.jurisdictionId,
      calculatedAt: new Date(),
    },
  };
}
