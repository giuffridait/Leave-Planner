export interface ProductQuery {
  category: string;
  label: string;
  query: string;
  /** Units contained in one purchaseable pack (e.g. 100 diapers per bag). */
  unitCount: number;
  /** Units consumed per month (e.g. 240 diapers/month for a newborn). */
  unitsPerMonth: number;
}

/**
 * monthlyEstimate = (fetchedPackPrice / unitCount) * unitsPerMonth
 *
 * Canonical SKUs are chosen to be consistently stocked at Walmart, Target,
 * and Amazon so the Google CSE search reliably surfaces a price snippet.
 */
export const PRODUCT_QUERIES: ProductQuery[] = [
  {
    category: "diapers",
    label: "Diapers",
    query: "Huggies Little Snugglers size 1 diapers 100 count",
    unitCount: 100,
    unitsPerMonth: 240, // ~8/day for a newborn
  },
  {
    category: "wipes",
    label: "Baby wipes",
    query: "Pampers Baby Fresh wipes 504 count",
    unitCount: 504,
    unitsPerMonth: 504, // roughly one big pack per month
  },
  {
    category: "formula",
    label: "Formula (if formula-feeding)",
    query: "Similac 360 Total Care infant formula powder 30.8oz",
    unitCount: 1,
    unitsPerMonth: 2.5, // ~2–3 canisters per month
  },
  {
    category: "wash",
    label: "Baby wash & shampoo",
    query: "Aveeno baby wash shampoo 18oz",
    unitCount: 1,
    unitsPerMonth: 0.5, // one bottle every ~2 months
  },
  {
    category: "clothing",
    label: "Onesies & bodysuits",
    query: "Carter's 5 pack short sleeve bodysuit newborn",
    unitCount: 5,
    unitsPerMonth: 5, // equivalent of one pack per month while growing fast
  },
];

/** Hardcoded monthly fallback (USD) used when Google CSE returns no price. */
export const STATIC_FALLBACK_MONTHLY: Record<string, number> = {
  diapers: 60,
  wipes: 15,
  formula: 320,
  wash: 25,
  clothing: 75,
};

export const PRODUCT_NOTES: Record<string, string> = {
  diapers: "Average ~8–12 changes/day for newborns, tapering after 3 months",
  wipes: "One large pack per month on average",
  formula: "~4 cans/month for a formula-fed newborn; skip entirely if breastfeeding",
  wash: "Averaged across wash, shampoo, lotion, and diaper cream",
  clothing: "Babies cycle through ~4 sizes in year one — multiple outfits needed daily; hand-me-downs cut this significantly",
};
