import type {
  Adjustment,
  Assumption,
  LeaveBreakdown,
  StructuredExplanation,
  Warning,
} from "../types";

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function buildExplanation(
  breakdown: LeaveBreakdown,
  assumptions: Assumption[],
  warnings: Warning[],
  adjustments: Adjustment[],
): StructuredExplanation {
  const totalPercent = breakdown.weeklyIncome === 0
    ? 0
    : (breakdown.weeklyBenefit / breakdown.weeklyIncome) * 100;

  const summary = `You planned ${breakdown.totalWeeks} weeks of leave with ${breakdown.paidWeeks} paid weeks at about ${formatPercent(totalPercent)} of weekly income.`;

  const assumptionNotes = assumptions.map(
    (assumption) => `${assumption.field}: ${JSON.stringify(assumption.value)} (${assumption.reason})`,
  );

  const capsApplied = adjustments
    .filter((adjustment) => adjustment.reason.toLowerCase().includes("cap"))
    .map(
      (adjustment) =>
        `${adjustment.field}: ${JSON.stringify(adjustment.originalValue)} → ${JSON.stringify(adjustment.adjustedValue)} (${adjustment.reason})`,
    );

  const warningNotes = warnings.map((warning) => warning.message);

  const doubleChecks: string[] = [];
  if (warnings.some((warning) => warning.type === "eligibility")) {
    doubleChecks.push("Confirm you meet state eligibility rules (tenure or hours worked)." );
  }
  if (assumptions.length > 0) {
    doubleChecks.push("Review any defaults applied to ensure they match your situation.");
  }
  if (breakdown.unpaidWeeks > 0) {
    doubleChecks.push(`Plan for ${breakdown.unpaidWeeks} unpaid weeks in your budget.`);
  }
  if (doubleChecks.length === 0) {
    doubleChecks.push("Verify your employer policy matches the assumed benefit rate.");
  }

  return {
    summary,
    assumptions: assumptionNotes,
    capsApplied,
    warnings: warningNotes,
    thingsToDoubleCheck: doubleChecks,
  };
}
