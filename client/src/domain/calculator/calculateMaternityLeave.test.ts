import { describe, expect, it } from "vitest";
import { calculateMaternityLeave } from "./calculateMaternityLeave";
import { resolveScenario } from "./resolveScenario";
import { validateAndApplyCaps } from "./validateAndApplyCaps";
import { US_CA_POLICY } from "../policies/us-ca";
import { US_GENERIC_POLICY } from "../policies/us-generic";

describe("domain calculator", () => {
  it("uses policy defaults when overrides are missing", () => {
    const inputs = { salary: 80000 };
    const { scenario, assumptions } = resolveScenario(inputs, US_GENERIC_POLICY);

    expect(scenario.leaveWeeks).toBe(US_GENERIC_POLICY.defaults.paidWeeks);
    expect(scenario.paidPercent).toBe(US_GENERIC_POLICY.defaults.paidPercent);
    expect(assumptions.length).toBeGreaterThan(0);
  });

  it("applies weekly benefit caps", () => {
    const policyWithCap = {
      ...US_GENERIC_POLICY,
      caps: { maxWeeklyBenefit: 500 },
    };
    const { scenario } = resolveScenario(
      { salary: 100000, paidPercent: 100, leaveWeeks: 4 },
      policyWithCap,
    );
    const { validated, adjustments } = validateAndApplyCaps(scenario, policyWithCap);

    const weeklyIncome = validated.salary / 52;
    const weeklyBenefit = weeklyIncome * ((validated.paidPercent + validated.employerTopUp) / 100);

    expect(weeklyBenefit).toBeLessThanOrEqual(500);
    expect(adjustments.some((adjustment) => adjustment.reason.includes("Cap"))).toBe(true);
  });

  it("calculates paid weeks after waiting period", () => {
    const result = calculateMaternityLeave(
      { salary: 70000, leaveWeeks: 12, paidPercent: 60 },
      US_CA_POLICY.jurisdictionId,
    );

    expect(result.breakdown.paidWeeks).toBe(7);
    expect(result.breakdown.unpaidWeeks).toBe(5);
  });
});
