import type { JurisdictionId } from "@/domain/types";

// Map IANA timezone → jurisdiction. Only timezones we have real policies for
// are mapped; everything else falls back to US-GENERIC.
const TIMEZONE_TO_JURISDICTION: Record<string, JurisdictionId> = {
  "America/Los_Angeles": "US-CA",
  "America/New_York": "US-NY",
  // Add more as policies are implemented:
  // "America/Chicago": "US-IL",
};

/**
 * Returns the best-guess JurisdictionId for the user's browser timezone.
 * Falls back to "US-GENERIC" if the timezone is unmapped or detection fails.
 */
export function detectJurisdiction(): JurisdictionId {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_JURISDICTION[tz] ?? "US-GENERIC";
  } catch {
    return "US-GENERIC";
  }
}
