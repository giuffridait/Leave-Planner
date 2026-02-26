export interface BabyCostLine {
  category: string;
  label: string;
  monthlyEstimate: number;
  isStateSpecific: boolean;
  note?: string;
}

export interface BabyCostEstimate {
  jurisdiction: string;
  leaveMonths: number;
  /** Multiplicative factor applied to all baselines, derived from BLS CPI data. */
  cpiAdjustmentFactor: number;
  /** Month/year the CPI data was current as of, e.g. "2024-11". */
  cpiDataDate: string;
  lines: BabyCostLine[];
  totalMonthly: number;
  totalForLeave: number;
}

export interface BabyCostApiResponse {
  estimate: BabyCostEstimate;
}
