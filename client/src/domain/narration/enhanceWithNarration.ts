import type { CalculationResult, UserInputs } from "../types";
import type { NarrationResult } from "./types";
import { featureFlags } from "@/lib/featureFlags";
import { prepareNarrationInput } from "./prepareNarrationInput";
import { callNarrationLLM } from "./callNarrationLLM";
import { validateNarration } from "./validateNarration";

export async function enhanceWithNarration(
  result: CalculationResult,
  inputs: UserInputs,
): Promise<CalculationResult & { narration?: NarrationResult }> {
  if (!featureFlags.llmNarration) {
    return result;
  }

  try {
    const narrationInput = prepareNarrationInput(result, inputs);
    const llmOutput = await callNarrationLLM(narrationInput);
    const validation = validateNarration(llmOutput, narrationInput);

    if (validation.safe) {
      return {
        ...result,
        narration: {
          success: true,
          narration: llmOutput,
          validationIssues: validation.warnings,
        },
      };
    }

    console.warn("[Narration] Validation failed:", validation.violations);

    return {
      ...result,
      narration: {
        success: false,
        error: "Safety validation failed",
        validationIssues: validation.violations,
      },
    };
  } catch (error) {
    console.error("[Narration] Enhancement failed:", error);

    return {
      ...result,
      narration: {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
