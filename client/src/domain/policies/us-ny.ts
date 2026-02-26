import type { PolicyConfig } from "./types";

// New York Paid Family Leave (NYPFL) — 2024 rates
// https://paidfamilyleave.ny.gov/
// Up to 12 weeks; benefit = 67% of employee's AWW, capped at 67% of NY State AWW.
// NY State AWW 2024: $1,718.15 → max weekly benefit ≈ $1,151.16
// Employees who work 20+ weeks/year (full-time) or earn $2,400+/year (part-time) qualify.
export const US_NY_POLICY: PolicyConfig = {
  jurisdictionId: "US-NY",
  displayName: "New York (NY)",
  currency: "USD",
  defaults: {
    paidWeeks: 12,
    paidPercent: 67,
  },
  caps: {
    maxPaidWeeks: 12,
    maxWeeklyBenefit: 1151,
  },
  eligibility: {
    minTenureMonths: 0,  // Varies: 26 weeks for full-time, no fixed tenure for part-time
    minHoursWorked: 0,
  },
  sources: ["NY Paid Family Leave (paidfamilyleave.ny.gov) — verify current year rates"],
  notes: "NY PFL 2024: up to 12 weeks at 67% of your average weekly wage (max $1,151/week). Confirm current rates with NY PFL.",
};
