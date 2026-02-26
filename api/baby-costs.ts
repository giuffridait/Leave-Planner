import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { babyCostsQuerySchema } from "../shared/routes";
import { getCostEstimate } from "../server/babyCosts/getCostEstimate";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const query = babyCostsQuerySchema.parse(req.query);
    const estimate = await getCostEstimate(query.jurisdiction, query.leaveWeeks);
    res.json(estimate);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join("."),
      });
      return;
    }
    console.error("[BabyCosts] Failed to compute estimate:", err);
    res.status(500).json({ message: "Failed to compute cost estimate" });
  }
}
