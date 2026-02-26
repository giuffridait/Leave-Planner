const CSE_ENDPOINT = "https://www.googleapis.com/customsearch/v1";

export interface GooglePriceResult {
  category: string;
  priceUsd: number | null;
  sourceUrl: string | null;
}

/**
 * Extracts a numeric USD price from a single Google CSE result item.
 *
 * Priority:
 *  1. pagemap.offer[0].price       — Google Shopping structured data
 *  2. pagemap.product[0].price     — product schema
 *  3. metatags og:price:amount     — Open Graph / Facebook product tags
 *  4. Regex on snippet text        — "$24.97" anywhere in the description
 */
function extractPrice(item: Record<string, unknown>): number | null {
  const pagemap = item.pagemap as Record<string, unknown[]> | undefined;

  const offerPrice = (pagemap?.offer?.[0] as Record<string, unknown> | undefined)?.price;
  if (offerPrice != null) {
    const n = parseFloat(String(offerPrice).replace(/[^0-9.]/g, ""));
    if (n > 0) return n;
  }

  const productPrice = (pagemap?.product?.[0] as Record<string, unknown> | undefined)?.price;
  if (productPrice != null) {
    const n = parseFloat(String(productPrice).replace(/[^0-9.]/g, ""));
    if (n > 0) return n;
  }

  const metatags = pagemap?.metatags?.[0] as Record<string, unknown> | undefined;
  const metaPrice = metatags?.["og:price:amount"] ?? metatags?.["product:price:amount"];
  if (metaPrice != null) {
    const n = parseFloat(String(metaPrice).replace(/[^0-9.]/g, ""));
    if (n > 0) return n;
  }

  const snippet = item.snippet as string | undefined;
  const snippetMatch = snippet?.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (snippetMatch) {
    const n = parseFloat(snippetMatch[1].replace(/,/g, ""));
    if (n > 0) return n;
  }

  return null;
}

export async function searchProductPrice(
  category: string,
  query: string,
): Promise<GooglePriceResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return { category, priceUsd: null, sourceUrl: null };
  }

  const params = new URLSearchParams({ key: apiKey, cx: cseId, q: query, num: "3" });

  const res = await fetch(`${CSE_ENDPOINT}?${params}`);
  if (!res.ok) {
    throw new Error(`Google CSE returned HTTP ${res.status} for query "${query}"`);
  }

  const data = (await res.json()) as { items?: Record<string, unknown>[] };

  for (const item of data.items ?? []) {
    const price = extractPrice(item);
    if (price !== null) {
      return { category, priceUsd: price, sourceUrl: (item.link as string) ?? null };
    }
  }

  return { category, priceUsd: null, sourceUrl: null };
}
