import type { CalculationResult, UserInputs } from "../types";
import type { NarrationInput } from "./types";

export function prepareNarrationInput(
  result: CalculationResult,
  inputs: UserInputs,
): NarrationInput {
  const { breakdown, explanation } = result;
  const allowedNumbers = new Set<string>();

  allowedNumbers.add(inputs.salary.toString());
  allowedNumbers.add((inputs.leaveWeeks ?? breakdown.totalWeeks).toString());

  allowedNumbers.add(breakdown.totalWeeks.toString());
  allowedNumbers.add(breakdown.paidWeeks.toString());
  allowedNumbers.add(breakdown.unpaidWeeks.toString());
  allowedNumbers.add(breakdown.totalIncomeGap.toString());
  allowedNumbers.add(breakdown.weeklyBenefit.toString());
  allowedNumbers.add(breakdown.weeklyIncome.toString());

  allowedNumbers.add(breakdown.totalIncomeGap.toLocaleString());
  allowedNumbers.add(Math.round(breakdown.totalIncomeGap).toString());

  if (inputs.paidPercent !== undefined) {
    allowedNumbers.add(inputs.paidPercent.toString());
  }

  return {
    jurisdiction: result.metadata.jurisdiction,
    userInputs: {
      salary: inputs.salary,
      leaveWeeks: inputs.leaveWeeks ?? breakdown.totalWeeks,
    },
    calculationSummary: {
      totalGap: breakdown.totalIncomeGap,
      paidWeeks: breakdown.paidWeeks,
      unpaidWeeks: breakdown.unpaidWeeks,
    },
    structuredExplanation: explanation,
    allowedNumbers,
  };
}
