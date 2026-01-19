import type { LLMNarration, NarrationInput } from "./types";
import { api } from "@shared/routes";

export async function callNarrationLLM(input: NarrationInput): Promise<LLMNarration> {
  const response = await fetch(api.narration.create.path, {
    method: api.narration.create.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jurisdiction: input.jurisdiction,
      userInputs: input.userInputs,
      calculationSummary: input.calculationSummary,
      structuredExplanation: input.structuredExplanation,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.error || body?.message;
    const message = detail ? `Narration API failed: ${detail}` : `Narration API failed: ${response.status}`;
    throw new Error(message);
  }

  return api.narration.create.responses[200].parse(await response.json());
}
