import type { z } from "zod";
import { api } from "../shared/routes";

type NarrationInput = z.infer<typeof api.narration.create.input>;

type NarrationOutput = z.infer<typeof api.narration.create.responses[200]>;

const DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const DEEPSEEK_MODEL_PREFIX = "deepseek-ai/DeepSeek-V3.2";

function getModel(): string {
  return process.env.HF_MODEL_ID || process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL;
}

function getApiKey(): string | undefined {
  return process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HUGGINGFACE_API_TOKEN;
}

function buildPrompt(input: NarrationInput): string {
  const basePrompt = `You are helping explain maternity leave calculations in a friendly, supportive way.

CRITICAL SAFETY RULES:
1. NEVER generate new numbers that weren't provided in the input
2. NEVER perform calculations or math
3. ONLY rephrase the provided explanation into natural, conversational language
4. Keep tone warm, supportive, and non-judgmental

FORMAT REQUIREMENTS:
- Output MUST be JSON only (no markdown, no code fences)
- friendlySummary must be a short paragraph of 2-3 sentences
- whatDroveTheGap must be 2-4 concise bullet strings
- thingsToDoubleCheck must be 2-4 concise bullet strings
- Use the structured explanation content to fill the bullets (assumptions, caps, warnings)

Input data:
Jurisdiction: ${input.jurisdiction}
Salary: $${input.userInputs.salary.toLocaleString()}
Leave duration: ${input.userInputs.leaveWeeks} weeks

Calculation results:
- Paid weeks: ${input.calculationSummary.paidWeeks}
- Unpaid weeks: ${input.calculationSummary.unpaidWeeks}
- Total income gap: $${input.calculationSummary.totalGap.toLocaleString()}

Structured explanation:
${JSON.stringify(input.structuredExplanation, null, 2)}

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON matching this exact schema
- No markdown, no code blocks, just raw JSON
- Use ONLY the numbers provided above
- Do NOT repeat the "Structured explanation" header

JSON Schema:
{
  "friendlySummary": "2-3 sentences giving overview in warm, supportive tone",
  "whatDroveTheGap": ["First reason the income gap exists", "Second reason", ...],
  "thingsToDoubleCheck": ["First thing to verify with employer/state", "Second thing to check", ...]
}
`;

  const model = getModel();
  if (model.startsWith(DEEPSEEK_MODEL_PREFIX)) {
    return `<\uFF5Cbegin\u2581of\u2581sentence\uFF5C><\uFF5CUser\uFF5C>${basePrompt}<\uFF5CAssistant\uFF5C>`;
  }

  return basePrompt;
}

function extractJsonPayload(text: string): string {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("LLM response did not include JSON payload");
  }
  return cleaned.slice(firstBrace, lastBrace + 1);
}

export async function callHuggingFaceNarration(
  input: NarrationInput,
): Promise<NarrationOutput> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is missing");
  }

  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      messages: [{ role: "user", content: buildPrompt(input) }],
      max_tokens: 500,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  const rawText = await response.text();
  const data = rawText ? JSON.parse(rawText) : null;
  if (!response.ok) {
    const message = data?.error?.message || data?.error || `HF API failed: ${response.status}`;
    throw new Error(String(message));
  }

  const generatedText = data?.choices?.[0]?.message?.content;

  if (typeof generatedText !== "string") {
    throw new Error("HF response missing message content");
  }

  const payload = extractJsonPayload(generatedText);
  return JSON.parse(payload) as NarrationOutput;
}
