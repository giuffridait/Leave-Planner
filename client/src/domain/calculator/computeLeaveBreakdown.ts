import type { LeaveBreakdown, Scenario } from "../types";

const WEEKS_PER_YEAR = 52;
const WEEKS_PER_MONTH = 4.33;

export function computeLeaveBreakdown(scenario: Scenario): LeaveBreakdown {
  const totalWeeks = scenario.leaveWeeks;
  const paidWeeks = Math.min(scenario.paidWeeks, totalWeeks);
  const unpaidWeeks = Math.max(0, totalWeeks - paidWeeks);
  const weeklyIncome = scenario.salary / WEEKS_PER_YEAR;
  const weeklyBenefit = weeklyIncome * ((scenario.paidPercent + scenario.employerTopUp) / 100);

  const monthlyCashflow = [] as LeaveBreakdown["monthlyCashflow"];
  let remainingWeeks = totalWeeks;
  let paidWeeksRemaining = paidWeeks;
  let monthIndex = 1;

  while (remainingWeeks > 0) {
    const weeksThisMonth = Math.min(WEEKS_PER_MONTH, remainingWeeks);
    const paidWeeksThisMonth = Math.min(weeksThisMonth, paidWeeksRemaining);
    const income = weeklyIncome * weeksThisMonth;
    const benefit = weeklyBenefit * paidWeeksThisMonth;
    const gap = income - benefit;

    monthlyCashflow.push({
      monthIndex,
      weeks: Number(weeksThisMonth.toFixed(2)),
      income,
      benefit,
      gap,
    });

    remainingWeeks -= weeksThisMonth;
    paidWeeksRemaining -= paidWeeksThisMonth;
    monthIndex += 1;
  }

  const totalIncomeGap = weeklyIncome * totalWeeks - weeklyBenefit * paidWeeks;
  const savingsNeeded = Math.max(0, totalIncomeGap);

  return {
    totalWeeks,
    paidWeeks,
    unpaidWeeks,
    weeklyIncome,
    weeklyBenefit,
    monthlyCashflow,
    totalIncomeGap,
    savingsNeeded,
  };
}
