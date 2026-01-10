
import { db } from "./db";
import { plans, type Plan, type InsertPlan } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createPlan(plan: InsertPlan): Promise<Plan>;
  getPlan(id: number): Promise<Plan | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(insertPlan).returning();
    return plan;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }
}

export const storage = new DatabaseStorage();
