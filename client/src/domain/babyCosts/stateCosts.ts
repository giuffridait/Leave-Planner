/**
 * Monthly infant center-based childcare costs by jurisdiction (2023 figures).
 *
 * Source: Child Care Aware of America — "Price of Care: State-Level Estimates
 * of Child Care Rates" (2023 edition).
 * https://www.childcareaware.org/price-of-care/
 *
 * These are statewide medians for infant (under 12 months) center-based care.
 * The server applies a BLS CPI adjustment to keep them current.
 */
export const STATE_CHILDCARE_MONTHLY: Record<string, number> = {
  "US-GENERIC": 1230, // national median
  "US-CA": 1770,      // California
  "US-NY": 2150,      // New York (statewide; NYC metro is higher ~$2,800)
};

export function getStateChildcareCost(jurisdictionId: string): number {
  return STATE_CHILDCARE_MONTHLY[jurisdictionId] ?? STATE_CHILDCARE_MONTHLY["US-GENERIC"];
}
