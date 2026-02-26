import { db } from "../db";
import { babyProductPrices } from "@shared/schema";
import { PRODUCT_QUERIES, STATIC_FALLBACK_MONTHLY, PRODUCT_NOTES } from "./productQueries";
import type { BabyCostResponse } from "@shared/routes";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isFresh(fetchedAt: Date): boolean {
  return Date.now() - fetchedAt.getTime() < SEVEN_DAYS_MS;
}

export async function getCostEstimate(
  jurisdiction: string,
  leaveWeeks: number,
): Promise<BabyCostResponse> {
  const leaveMonths = leaveWeeks / 4.333;

  // Attempt to read live prices from DB
  const dbRows = db
    ? await db.select().from(babyProductPrices)
    : [];

  const rowByCategory = new Map(dbRows.map((r) => [r.category, r]));

  let usedLivePrice = false;
  let latestFetchedAt: Date | null = null;

  const lines = PRODUCT_QUERIES.map((pq) => {
    const row = rowByCategory.get(pq.category);
    let monthlyEstimate: number;

    if (row && row.priceUsd != null && isFresh(row.fetchedAt)) {
      monthlyEstimate = (row.priceUsd / row.unitCount) * row.unitsPerMonth;
      usedLivePrice = true;
      if (!latestFetchedAt || row.fetchedAt > latestFetchedAt) {
        latestFetchedAt = row.fetchedAt;
      }
    } else {
      monthlyEstimate = STATIC_FALLBACK_MONTHLY[pq.category] ?? 0;
    }

    return {
      category: pq.category,
      label: pq.label,
      monthlyEstimate: Math.round(monthlyEstimate * 100) / 100,
      note: PRODUCT_NOTES[pq.category],
    };
  });

  const totalMonthly = lines.reduce((sum, l) => sum + l.monthlyEstimate, 0);

  return {
    lines,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalForLeave: Math.round(totalMonthly * leaveMonths * 100) / 100,
    leaveMonths: Math.round(leaveMonths * 10) / 10,
    source: usedLivePrice ? "google-cse" : "static-fallback",
    pricedAt: latestFetchedAt ? (latestFetchedAt as Date).toISOString() : null,
  };
}
