import type { Assumption, PolicyConfig, Scenario, UserInputs } from "../types";

export function resolveScenario(
  inputs: UserInputs,
  policy: PolicyConfig,
): { scenario: Scenario; assumptions: Assumption[] } {
  const assumptions: Assumption[] = [];

  const leaveWeeks = inputs.leaveWeeks ?? policy.defaults.paidWeeks;
  if (inputs.leaveWeeks === undefined) {
    assumptions.push({
      field: "leaveWeeks",
      value: leaveWeeks,
      reason: "Used the policy default for paid leave weeks.",
    });
  }

  const paidPercent = inputs.paidPercent ?? policy.defaults.paidPercent;
  if (inputs.paidPercent === undefined) {
    assumptions.push({
      field: "paidPercent",
      value: paidPercent,
      reason: "Used the policy default benefit percentage.",
    });
  }

  const employerTopUp = inputs.employerTopUp ?? 0;
  if (inputs.employerTopUp === undefined) {
    assumptions.push({
      field: "employerTopUp",
      value: employerTopUp,
      reason: "Assumed no employer top-up was provided.",
    });
  }

  const paidWeeks = Math.min(policy.defaults.paidWeeks, leaveWeeks);
  if (leaveWeeks > paidWeeks) {
    assumptions.push({
      field: "paidWeeks",
      value: paidWeeks,
      reason: "Paid weeks are capped by the policy default paid duration.",
    });
  }

  const startDate = inputs.startDate ? new Date(inputs.startDate) : undefined;

  return {
    scenario: {
      salary: inputs.salary,
      leaveWeeks,
      paidWeeks,
      paidPercent,
      employerTopUp,
      startDate,
    },
    assumptions,
  };
}
