import { db } from "../db";
import { babyProductPrices } from "@shared/schema";
import { PRODUCT_QUERIES } from "./productQueries";
import { searchProductPrice } from "./googlePriceSearch";
import { log } from "../log";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function isRefreshNeeded(): Promise<boolean> {
  if (!db) return false;
  const rows = await db
    .select({ fetchedAt: babyProductPrices.fetchedAt })
    .from(babyProductPrices)
    .limit(1);
  if (rows.length === 0) return true;
  return Date.now() - rows[0].fetchedAt.getTime() > SEVEN_DAYS_MS;
}

export async function runPriceRefresh(): Promise<void> {
  if (!db) return;

  log("Starting weekly price refresh...", "babyCosts");

  const results = await Promise.allSettled(
    PRODUCT_QUERIES.map((pq) => searchProductPrice(pq.category, pq.query)),
  );

  const now = new Date();

  for (let i = 0; i < PRODUCT_QUERIES.length; i++) {
    const pq = PRODUCT_QUERIES[i];
    const settled = results[i];
    const found = settled.status === "fulfilled" ? settled.value : null;

    if (settled.status === "rejected") {
      log(`Price search failed for "${pq.category}": ${settled.reason}`, "babyCosts");
    }

    await db
      .insert(babyProductPrices)
      .values({
        category: pq.category,
        label: pq.label,
        query: pq.query,
        priceUsd: found?.priceUsd ?? null,
        sourceUrl: found?.sourceUrl ?? null,
        unitCount: pq.unitCount,
        unitsPerMonth: pq.unitsPerMonth,
        fetchedAt: now,
      })
      .onConflictDoUpdate({
        target: babyProductPrices.category,
        set: {
          priceUsd: found?.priceUsd ?? null,
          sourceUrl: found?.sourceUrl ?? null,
          fetchedAt: now,
        },
      });
  }

  log("Price refresh complete.", "babyCosts");
}

/** Call once on server startup. Runs immediately if stale, then rechecks every 24 h. */
export function schedulePriceRefresh(): void {
  isRefreshNeeded()
    .then((needed) => {
      if (needed) runPriceRefresh().catch((err) => log(`Refresh error: ${err}`, "babyCosts"));
    })
    .catch((err) => log(`isRefreshNeeded error: ${err}`, "babyCosts"));

  setInterval(() => {
    isRefreshNeeded()
      .then((needed) => {
        if (needed) runPriceRefresh().catch((err) => log(`Refresh error: ${err}`, "babyCosts"));
      })
      .catch((err) => log(`isRefreshNeeded error: ${err}`, "babyCosts"));
  }, CHECK_INTERVAL_MS);
}
