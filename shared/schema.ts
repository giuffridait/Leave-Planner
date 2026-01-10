
import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
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

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
