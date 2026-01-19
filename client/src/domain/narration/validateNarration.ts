import type { LLMNarration, NarrationInput } from "./types";

export interface ValidationResult {
  safe: boolean;
  violations: string[];
  warnings: string[];
}

export function validateNarration(
  narration: LLMNarration,
  input: NarrationInput,
): ValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  if (!narration.friendlySummary || typeof narration.friendlySummary !== "string") {
    violations.push("Missing or invalid friendlySummary");
  }
  if (!Array.isArray(narration.whatDroveTheGap)) {
    violations.push("whatDroveTheGap must be an array");
  }
  if (!Array.isArray(narration.thingsToDoubleCheck)) {
    violations.push("thingsToDoubleCheck must be an array");
  }

  const fullText = JSON.stringify(narration);
  const numbersInOutput = extractNumbers(fullText);

  for (const num of numbersInOutput) {
    if (!input.allowedNumbers.has(num)) {
      const numValue = parseFloat(num.replace(/,/g, ""));
      let found = false;

      for (const allowed of input.allowedNumbers) {
        const allowedValue = parseFloat(allowed.replace(/,/g, ""));
        if (allowedValue === 0) {
          continue;
        }
        if (Math.abs(numValue - allowedValue) / allowedValue < 0.01) {
          found = true;
          warnings.push(`Number ${num} is rounded from ${allowed}`);
          break;
        }
      }

      if (!found) {
        violations.push(`Unauthorized number: ${num}`);
      }
    }
  }

  const calculationPhrases = [
    "calculated",
    "computed",
    "multiplied",
    "divided",
    "equals",
    "totals",
    "adds up to",
  ];

  for (const phrase of calculationPhrases) {
    if (fullText.toLowerCase().includes(phrase)) {
      warnings.push(`Contains calculation language: "${phrase}"`);
    }
  }

  return {
    safe: violations.length === 0,
    violations,
    warnings,
  };
}

function extractNumbers(text: string): string[] {
  const numberRegex = /\$?\d[\d,]*\.?\d*/g;
  const matches = text.match(numberRegex) || [];

  return matches
    .map((match) => match.replace(/\$/g, "").replace(/[.,]+$/g, "").trim())
    .filter((match) => match.length > 0);
}
