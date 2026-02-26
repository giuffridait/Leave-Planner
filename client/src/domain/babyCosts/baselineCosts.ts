import type { BabyCostLine } from "./types";

/**
 * Monthly baseline costs anchored to 2023 national US averages.
 * The server applies a BLS CPI adjustment factor on top of these.
 *
 * Sources:
 * - USDA Expenditures on Children by Families (2023)
 * - Consumer Reports baby cost estimates
 * - NerdWallet baby cost guide
 */
export const BASELINE_MONTHLY_COSTS: Omit<BabyCostLine, "monthlyEstimate"> & { baselineMonthly: number }[] = [
  {
    category: "diapers",
    label: "Diapers & wipes",
    baselineMonthly: 80,
    isStateSpecific: false,
    note: "Newborns use 8–12 diapers/day; cost drops after 6 months.",
  },
  {
    category: "formula",
    label: "Formula (if not breastfeeding)",
    baselineMonthly: 140,
    isStateSpecific: false,
    note: "Skip this line if breastfeeding exclusively.",
  },
  {
    category: "clothing",
    label: "Clothing & shoes",
    baselineMonthly: 75,
    isStateSpecific: false,
    note: "Babies outgrow sizes quickly; thrift/hand-me-downs cut this significantly.",
  },
  {
    category: "healthcare",
    label: "Healthcare (copays & visits)",
    baselineMonthly: 55,
    isStateSpecific: false,
    note: "Well-baby visits are frequent in the first year. Excludes hospital delivery costs.",
  },
  {
    category: "gear",
    label: "Gear & supplies (amortized)",
    baselineMonthly: 100,
    isStateSpecific: false,
    note: "Crib, stroller, car seat, etc. spread over the first year.",
  },
];

/** 2023 CPI index for "Child care and nursery school" (BLS series CUUR0000SEEA01). */
export const BASELINE_CHILDCARE_CPI = 268.0;
