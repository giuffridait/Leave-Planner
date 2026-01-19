
import { db } from "./db";
import { plans, type Plan, type InsertPlan } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createPlan(plan: InsertPlan): Promise<Plan>;
  getPlan(id: number): Promise<Plan | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    if (!db) {
      throw new Error("Database unavailable");
    }
    const [plan] = await db.insert(plans).values(insertPlan).returning();
    return plan;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    if (!db) {
      throw new Error("Database unavailable");
    }
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }
}

class MemoryStorage implements IStorage {
  private plans: Plan[] = [];
  private nextId = 1;

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const plan: Plan = {
      id: this.nextId++,
      createdAt: new Date(),
      ...insertPlan,
    };
    this.plans.push(plan);
    return plan;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.find((plan) => plan.id === id);
  }
}

export const storage: IStorage = db ? new DatabaseStorage() : new MemoryStorage();
