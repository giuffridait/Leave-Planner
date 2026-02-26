import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { BabyCostResponse } from "@shared/routes";

async function fetchBabyCosts(
  jurisdiction: string,
  leaveWeeks: number,
): Promise<BabyCostResponse> {
  const params = new URLSearchParams({
    jurisdiction,
    leaveWeeks: String(leaveWeeks),
  });
  const res = await fetch(`${api.babyCosts.get.path}?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch baby costs: ${res.status}`);
  }
  return res.json() as Promise<BabyCostResponse>;
}

export function useBabyCosts(jurisdiction: string, leaveWeeks: number) {
  return useQuery({
    queryKey: ["baby-costs", jurisdiction, leaveWeeks],
    queryFn: () => fetchBabyCosts(jurisdiction, leaveWeeks),
    staleTime: 1000 * 60 * 60 * 24, // 24 h — mirrors the server's weekly refresh cadence
    retry: 1,
  });
}
