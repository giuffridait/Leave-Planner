export type JurisdictionId = 'US-CA' | 'US-NY' | 'US-GENERIC' | string;

export interface UserInputs {
  salary: number;
  leaveWeeks?: number;
  paidPercent?: number;
  employerTopUp?: number;
  startDate?: string;
}

export interface PolicyConfig {
  jurisdictionId: JurisdictionId;
  displayName: string;
  currency: string;
  defaults: {
    paidWeeks: number;
    paidPercent: number;
    waitingDays?: number;
  };
  caps: {
    maxPaidWeeks?: number;
    maxWeeklyBenefit?: number;
    maxTotalBenefit?: number;
  };
  eligibility?: {
    minTenureMonths?: number;
    minHoursWorked?: number;
  };
  sources?: string[];
  notes?: string;
}

export interface Scenario {
  salary: number;
  leaveWeeks: number;
  paidWeeks: number;
  paidPercent: number;
  employerTopUp: number;
  startDate?: Date;
}

export interface Assumption {
  field: string;
  value: unknown;
  reason: string;
}

export interface Warning {
  type: 'eligibility' | 'cap' | 'validation';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface Adjustment {
  field: string;
  originalValue: unknown;
  adjustedValue: unknown;
  reason: string;
}

export interface MonthlyProjection {
  monthIndex: number;
  weeks: number;
  income: number;
  benefit: number;
  gap: number;
}

export interface LeaveBreakdown {
  totalWeeks: number;
  paidWeeks: number;
  unpaidWeeks: number;
  weeklyIncome: number;
  weeklyBenefit: number;
  monthlyCashflow: MonthlyProjection[];
  totalIncomeGap: number;
  savingsNeeded: number;
}

export interface StructuredExplanation {
  summary: string;
  assumptions: string[];
  capsApplied: string[];
  warnings: string[];
  thingsToDoubleCheck: string[];
}

export interface CalculationResult {
  breakdown: LeaveBreakdown;
  explanation: StructuredExplanation;
  metadata: {
    jurisdiction: JurisdictionId;
    calculatedAt: Date;
  };
}

export interface CalculationOptions {
  includeNarration?: boolean;
}
