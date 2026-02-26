
import { pgTable, text, serial, integer, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  // Income Inputs
  annualSalary: integer("annual_salary").notNull(),
  leaveWeeks: integer("leave_weeks").notNull(),
  paidLeavePercent: integer("paid_leave_percent").notNull(),
  currentSavings: integer("current_savings").notNull().default(0),
  
  // Expenses (Stored as JSON for flexibility with defaults)
  // Structure: { housing: number, utilities: number, groceries: number, ... }
  expenses: jsonb("expenses").notNull(),
  
  // Childcare / Return to Work (Stored as JSON)
  // Structure: { type: string, cost: number, returnOption: string }
  childcare: jsonb("childcare").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true
});

/**
 * One row per product category, upserted by the weekly price-refresh job.
 * priceUsd is null when the Google CSE search returned no parseable price.
 */
export const babyProductPrices = pgTable("baby_product_prices", {
  id: serial("id").primaryKey(),
  category: text("category").notNull().unique(),
  label: text("label").notNull(),
  query: text("query").notNull(),
  priceUsd: real("price_usd"),
  sourceUrl: text("source_url"),
  unitCount: integer("unit_count").notNull(),
  unitsPerMonth: real("units_per_month").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
