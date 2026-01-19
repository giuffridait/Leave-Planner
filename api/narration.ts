import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { api } from "../shared/routes";
import { callHuggingFaceNarration } from "../server/narration";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== api.narration.create.method) {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const input = api.narration.create.input.parse(body);
    const narration = await callHuggingFaceNarration(input);
    res.status(200).json(narration);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join("."),
      });
      return;
    }
    console.error("[Narration] Failed to generate narration:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const payload = process.env.NODE_ENV === "production"
      ? { message: "Narration service unavailable" }
      : { message: "Narration service unavailable", error: errorMessage };
    res.status(502).json(payload);
  }
}
