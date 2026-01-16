import type { PolicyConfig } from "./types";

export const US_GENERIC_POLICY: PolicyConfig = {
  jurisdictionId: "US-GENERIC",
  displayName: "United States (Generic)",
  currency: "USD",
  defaults: {
    paidWeeks: 6,
    paidPercent: 60,
  },
  caps: {
    maxPaidWeeks: 12,
  },
  notes: "Generic defaults; replace with your state's program details when available.",
};
