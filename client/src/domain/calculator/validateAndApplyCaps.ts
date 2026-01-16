import type { Adjustment, PolicyConfig, Scenario, Warning } from "../types";

const WEEKS_PER_YEAR = 52;

function clampNumber(value: number, min: number): number {
  return Number.isFinite(value) ? Math.max(value, min) : min;
}

export function validateAndApplyCaps(
  scenario: Scenario,
  policy: PolicyConfig,
): { validated: Scenario; warnings: Warning[]; adjustments: Adjustment[] } {
  const warnings: Warning[] = [];
  const adjustments: Adjustment[] = [];
  const validated: Scenario = { ...scenario };

  const leaveWeeks = clampNumber(validated.leaveWeeks, 0);
  if (leaveWeeks !== validated.leaveWeeks) {
    adjustments.push({
      field: "leaveWeeks",
      originalValue: validated.leaveWeeks,
      adjustedValue: leaveWeeks,
      reason: "Validation: leave weeks cannot be negative.",
    });
    validated.leaveWeeks = leaveWeeks;
  }

  const paidWeeks = clampNumber(validated.paidWeeks, 0);
  if (paidWeeks !== validated.paidWeeks) {
    adjustments.push({
      field: "paidWeeks",
      originalValue: validated.paidWeeks,
      adjustedValue: paidWeeks,
      reason: "Validation: paid weeks cannot be negative.",
    });
    validated.paidWeeks = paidWeeks;
  }

  if (validated.paidWeeks > validated.leaveWeeks) {
    adjustments.push({
      field: "paidWeeks",
      originalValue: validated.paidWeeks,
      adjustedValue: validated.leaveWeeks,
      reason: "Validation: paid weeks cannot exceed total leave weeks.",
    });
    validated.paidWeeks = validated.leaveWeeks;
  }

  const paidPercent = clampNumber(validated.paidPercent, 0);
  if (paidPercent !== validated.paidPercent) {
    adjustments.push({
      field: "paidPercent",
      originalValue: validated.paidPercent,
      adjustedValue: paidPercent,
      reason: "Validation: paid percent cannot be negative.",
    });
    validated.paidPercent = paidPercent;
  }

  if (validated.paidPercent > 100) {
    adjustments.push({
      field: "paidPercent",
      originalValue: validated.paidPercent,
      adjustedValue: 100,
      reason: "Validation: paid percent cannot exceed 100%.",
    });
    validated.paidPercent = 100;
  }

  const employerTopUp = clampNumber(validated.employerTopUp, 0);
  if (employerTopUp !== validated.employerTopUp) {
    adjustments.push({
      field: "employerTopUp",
      originalValue: validated.employerTopUp,
      adjustedValue: employerTopUp,
      reason: "Validation: employer top-up cannot be negative.",
    });
    validated.employerTopUp = employerTopUp;
  }

  if (validated.employerTopUp > 100) {
    adjustments.push({
      field: "employerTopUp",
      originalValue: validated.employerTopUp,
      adjustedValue: 100,
      reason: "Validation: employer top-up cannot exceed 100%.",
    });
    validated.employerTopUp = 100;
  }

  if (policy.caps.maxPaidWeeks !== undefined && validated.paidWeeks > policy.caps.maxPaidWeeks) {
    adjustments.push({
      field: "paidWeeks",
      originalValue: validated.paidWeeks,
      adjustedValue: policy.caps.maxPaidWeeks,
      reason: "Cap applied: paid weeks exceed the policy maximum.",
    });
    validated.paidWeeks = policy.caps.maxPaidWeeks;
  }

  if (policy.defaults.waitingDays) {
    const waitingWeeks = policy.defaults.waitingDays / 7;
    const adjustedPaidWeeks = Math.max(0, validated.paidWeeks - waitingWeeks);
    if (adjustedPaidWeeks !== validated.paidWeeks) {
      adjustments.push({
        field: "paidWeeks",
        originalValue: validated.paidWeeks,
        adjustedValue: adjustedPaidWeeks,
        reason: "Cap applied: waiting period reduces paid weeks.",
      });
      validated.paidWeeks = adjustedPaidWeeks;
    }
  }

  const totalPaidPercent = validated.paidPercent + validated.employerTopUp;
  if (totalPaidPercent > 100) {
    const adjustedTopUp = Math.max(0, 100 - validated.paidPercent);
    adjustments.push({
      field: "totalPaidPercent",
      originalValue: totalPaidPercent,
      adjustedValue: 100,
      reason: "Cap applied: total paid percent cannot exceed 100%.",
    });
    validated.employerTopUp = adjustedTopUp;
  }

  const weeklyIncome = validated.salary / WEEKS_PER_YEAR;
  const totalPercentAfterCap = validated.paidPercent + validated.employerTopUp;
  let weeklyBenefit = weeklyIncome * (totalPercentAfterCap / 100);

  if (policy.caps.maxWeeklyBenefit !== undefined && weeklyBenefit > policy.caps.maxWeeklyBenefit) {
    const adjustedPercent = (policy.caps.maxWeeklyBenefit / weeklyIncome) * 100;
    adjustments.push({
      field: "weeklyBenefit",
      originalValue: weeklyBenefit,
      adjustedValue: policy.caps.maxWeeklyBenefit,
      reason: "Cap applied: weekly benefit exceeds the policy maximum.",
    });

    if (adjustedPercent <= validated.paidPercent) {
      validated.paidPercent = adjustedPercent;
      validated.employerTopUp = 0;
    } else {
      validated.employerTopUp = adjustedPercent - validated.paidPercent;
    }
    weeklyBenefit = policy.caps.maxWeeklyBenefit;
  }

  if (
    policy.caps.maxTotalBenefit !== undefined &&
    validated.paidWeeks > 0 &&
    weeklyBenefit * validated.paidWeeks > policy.caps.maxTotalBenefit
  ) {
    const adjustedWeeklyBenefit = policy.caps.maxTotalBenefit / validated.paidWeeks;
    const adjustedPercent = (adjustedWeeklyBenefit / weeklyIncome) * 100;
    adjustments.push({
      field: "totalBenefit",
      originalValue: weeklyBenefit * validated.paidWeeks,
      adjustedValue: policy.caps.maxTotalBenefit,
      reason: "Cap applied: total benefit exceeds the policy maximum.",
    });

    if (adjustedPercent <= validated.paidPercent) {
      validated.paidPercent = adjustedPercent;
      validated.employerTopUp = 0;
    } else {
      validated.employerTopUp = adjustedPercent - validated.paidPercent;
    }
  }

  if (policy.eligibility?.minTenureMonths || policy.eligibility?.minHoursWorked) {
    warnings.push({
      type: "eligibility",
      severity: "info",
      message: "Eligibility requirements may apply based on tenure or hours worked.",
    });
  }

  if (validated.leaveWeeks === 0) {
    warnings.push({
      type: "validation",
      severity: "warning",
      message: "Leave weeks are set to 0, so no benefit is calculated.",
    });
  }

  return { validated, warnings, adjustments };
}
