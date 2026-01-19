
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { callHuggingFaceNarration } from "./narration";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.plans.create.path, async (req, res) => {
    try {
      const input = api.plans.create.input.parse(req.body);
      const plan = await storage.createPlan(input);
      res.status(201).json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.plans.get.path, async (req, res) => {
    const plan = await storage.getPlan(Number(req.params.id));
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  });

  app.post(api.narration.create.path, async (req, res) => {
    try {
      const input = api.narration.create.input.parse(req.body);
      const narration = await callHuggingFaceNarration(input);
      res.status(200).json(narration);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("[Narration] Failed to generate narration:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const payload = process.env.NODE_ENV === "production"
        ? { message: "Narration service unavailable" }
        : { message: "Narration service unavailable", error: errorMessage };
      return res.status(502).json(payload);
    }
  });

  return httpServer;
}
