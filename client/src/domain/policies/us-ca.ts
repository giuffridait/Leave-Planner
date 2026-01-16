import type { PolicyConfig } from "./types";

export const US_CA_POLICY: PolicyConfig = {
  jurisdictionId: "US-CA",
  displayName: "California (CA)",
  currency: "USD",
  defaults: {
    paidWeeks: 8,
    paidPercent: 60,
    waitingDays: 7,
  },
  caps: {
    maxPaidWeeks: 8,
    maxWeeklyBenefit: 1620,
  },
  eligibility: {
    minHoursWorked: 300,
  },
  sources: ["CA EDD SDI/PFL (verify current rates)"],
  notes: "Rates and caps change yearly; confirm with the California EDD.",
};
