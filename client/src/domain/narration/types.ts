import type { StructuredExplanation } from "../types";

export interface NarrationInput {
  jurisdiction: string;
  userInputs: {
    salary: number;
    leaveWeeks: number;
  };
  calculationSummary: {
    totalGap: number;
    paidWeeks: number;
    unpaidWeeks: number;
  };
  structuredExplanation: StructuredExplanation;
  allowedNumbers: Set<string>;
}

export interface LLMNarration {
  friendlySummary: string;
  whatDroveTheGap: string[];
  thingsToDoubleCheck: string[];
}

export interface NarrationResult {
  success: boolean;
  narration?: LLMNarration;
  error?: string;
  validationIssues?: string[];
}
