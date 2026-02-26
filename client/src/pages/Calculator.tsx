import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, RefreshCcw, ShieldCheck, AlertTriangle } from "lucide-react";
import { analytics } from "../lib/analytics";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "@/components/StepIndicator";
import { MoneyInput } from "@/components/MoneyInput";
import { IncomeBenefitChart } from "@/components/ResultCharts";
import { NarrationDisplay } from "@/components/NarrationDisplay";
import { NarrationToggle } from "@/components/NarrationToggle";

import { calculateMaternityLeave } from "@/domain/calculator/calculateMaternityLeave";
import { enhanceWithNarration } from "@/domain/narration/enhanceWithNarration";
import { getPolicyConfig, listPolicies } from "@/domain/policies";
import type { JurisdictionId, UserInputs } from "@/domain/types";
import type { NarrationResult } from "@/domain/narration/types";
import { resolveLlmNarrationFlag } from "@/lib/featureFlags";
import { detectJurisdiction } from "@/lib/geoDetect";
import { BabyCostCard } from "@/components/BabyCostCard";

const STEPS = ["Inputs", "Results"];
const DEFAULT_SALARY = 65000;

interface FormState {
  jurisdictionId: JurisdictionId;
  salary: number;
  leaveWeeks?: number;
  paidPercent?: number;
  employerTopUp?: number;
  startDate?: string;
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [narrationEnabled, setNarrationEnabled] = useState(() => resolveLlmNarrationFlag());
  const [narrationResult, setNarrationResult] = useState<NarrationResult | undefined>(undefined);

  const detectedJurisdiction = detectJurisdiction();
  const initialPolicy = getPolicyConfig(detectedJurisdiction);
  const [formData, setFormData] = useState<FormState>({
    jurisdictionId: initialPolicy.jurisdictionId,
    salary: DEFAULT_SALARY,
    leaveWeeks: initialPolicy.defaults.paidWeeks,
    paidPercent: initialPolicy.defaults.paidPercent,
    employerTopUp: 0,
    startDate: "",
  });

  const policy = useMemo(() => getPolicyConfig(formData.jurisdictionId), [formData.jurisdictionId]);

  const inputs: UserInputs = useMemo(
    () => ({
      salary: formData.salary,
      leaveWeeks: formData.leaveWeeks,
      paidPercent: formData.paidPercent,
      employerTopUp: formData.employerTopUp,
      startDate: formData.startDate || undefined,
    }),
    [formData],
  );

  const result = useMemo(
    () => calculateMaternityLeave(inputs, formData.jurisdictionId),
    [inputs, formData.jurisdictionId],
  );

  useEffect(() => {
    let cancelled = false;

    if (!narrationEnabled || currentStep !== 2) {
      setNarrationResult(undefined);
      return undefined;
    }

    enhanceWithNarration(result, inputs)
      .then((enhanced) => {
        if (!cancelled) {
          setNarrationResult(enhanced.narration);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNarrationResult({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [narrationEnabled, currentStep, result, inputs]);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      if (currentStep === 1) {
        analytics.step1Completed({
          salary: formData.salary,
          leaveWeeks: formData.leaveWeeks ?? policy.defaults.paidWeeks,
          paidPercent: formData.paidPercent ?? policy.defaults.paidPercent,
          jurisdiction: formData.jurisdictionId,
        });
      }
      setDirection(1);
      setCurrentStep((step) => step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((step) => step - 1);
    }
  };

  useEffect(() => {
    if (currentStep === 2) {
      analytics.resultsViewed(result.breakdown.savingsNeeded);
    }
  }, [currentStep, result.breakdown.savingsNeeded]);

  const handleReset = () => {
    analytics.startOver();
    setFormData({
      jurisdictionId: initialPolicy.jurisdictionId,
      salary: DEFAULT_SALARY,
      leaveWeeks: initialPolicy.defaults.paidWeeks,
      paidPercent: initialPolicy.defaults.paidPercent,
      employerTopUp: 0,
      startDate: "",
    });
    setCurrentStep(1);
  };

  const handleJurisdictionChange = (value: JurisdictionId) => {
    const newPolicy = getPolicyConfig(value);
    setFormData((prev) => ({
      ...prev,
      jurisdictionId: newPolicy.jurisdictionId,
      leaveWeeks: newPolicy.defaults.paidWeeks,
      paidPercent: newPolicy.defaults.paidPercent,
    }));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="font-bold text-xl tracking-tight font-display text-primary">
              LeaveCalc
            </Link>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
          <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {currentStep === 1 && (
              <InputsStep
                data={formData}
                policyName={policy.displayName}
                policyNotes={policy.notes}
                narrationEnabled={narrationEnabled}
                onNarrationToggle={setNarrationEnabled}
                onChange={setFormData}
                onJurisdictionChange={handleJurisdictionChange}
                liveResult={result}
              />
            )}
            {currentStep === 2 && (
              <ResultsStep
                policyName={policy.displayName}
                result={result}
                narrationEnabled={narrationEnabled}
                narration={narrationResult}
                jurisdiction={formData.jurisdictionId}
                leaveWeeks={formData.leaveWeeks ?? policy.defaults.paidWeeks}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex gap-4">
          {currentStep > 1 && (
            <Button variant="outline" size="lg" className="flex-1" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {currentStep < STEPS.length ? (
            <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90" onClick={nextStep}>
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" className="flex-1" variant="outline" onClick={handleReset}>
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function InputsStep({
  data,
  policyName,
  policyNotes,
  narrationEnabled,
  onNarrationToggle,
  onChange,
  onJurisdictionChange,
  liveResult,
}: {
  data: FormState;
  policyName: string;
  policyNotes?: string;
  narrationEnabled: boolean;
  onNarrationToggle: (enabled: boolean) => void;
  onChange: Dispatch<SetStateAction<FormState>>;
  onJurisdictionChange: (value: JurisdictionId) => void;
  liveResult: ReturnType<typeof calculateMaternityLeave>;
}) {
  const liveGap = liveResult.breakdown.savingsNeeded;
  const liveWeeklyBenefit = liveResult.breakdown.weeklyBenefit;
  const liveWeeklyIncome = liveResult.breakdown.weeklyIncome;
  const livePaidWeeks = liveResult.breakdown.paidWeeks;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground">Plan your leave.</h2>
        <p className="text-muted-foreground mt-2">Pick a state policy and enter your salary details.</p>
      </div>

      {/* Live estimate preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Live estimate — income gap</p>
          <p className="text-3xl font-bold font-display text-primary">{formatCurrency(liveGap)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">over {liveResult.breakdown.totalWeeks} weeks</p>
        </div>
        <div className="flex gap-6 text-center text-sm">
          <div>
            <p className="font-semibold text-foreground">{formatCurrency(liveWeeklyBenefit)}<span className="font-normal text-muted-foreground">/wk</span></p>
            <p className="text-xs text-muted-foreground">benefit</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{formatCurrency(liveWeeklyIncome)}<span className="font-normal text-muted-foreground">/wk</span></p>
            <p className="text-xs text-muted-foreground">normal pay</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{livePaidWeeks}<span className="font-normal text-muted-foreground"> wks</span></p>
            <p className="text-xs text-muted-foreground">paid</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-base">State Policy</Label>
            <select
              className="w-full h-12 rounded-xl border border-input px-3 bg-background"
              value={data.jurisdictionId}
              onChange={(e) => onJurisdictionChange(e.target.value as JurisdictionId)}
            >
              {listPolicies().map((policy) => (
                <option key={policy.jurisdictionId} value={policy.jurisdictionId}>
                  {policy.displayName}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {policyNotes ?? "State defaults are applied when fields are left blank."}
            </p>
          </div>

          <NarrationToggle enabled={narrationEnabled} onToggle={onNarrationToggle} />

          <div className="space-y-2">
            <Label className="text-base">Annual Salary (Pre-tax)</Label>
            <MoneyInput
              value={data.salary}
              onValueChange={(val) => onChange((prev) => ({ ...prev, salary: val }))}
              className="text-lg h-14"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-base">Total Leave Weeks</Label>
              <Input
                type="number"
                min={0}
                max={52}
                value={data.leaveWeeks ?? ""}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, leaveWeeks: parseOptionalNumber(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">Leave blank to use state defaults.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-base">Paid Percent</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={data.paidPercent ?? ""}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, paidPercent: parseOptionalNumber(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">Leave blank to use {policyName} defaults.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-base">Employer Top-Up (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={data.employerTopUp ?? ""}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, employerTopUp: parseOptionalNumber(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">Optional employer-paid supplement.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-base">Leave Start Date (Optional)</Label>
              <Input
                type="date"
                value={data.startDate ?? ""}
                onChange={(e) => onChange((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultsStep({
  policyName,
  result,
  narrationEnabled,
  narration,
  jurisdiction,
  leaveWeeks,
}: {
  policyName: string;
  result: ReturnType<typeof calculateMaternityLeave>;
  narrationEnabled: boolean;
  narration?: NarrationResult;
  jurisdiction: string;
  leaveWeeks: number;
}) {
  const effectivePercent = result.breakdown.weeklyIncome
    ? (result.breakdown.weeklyBenefit / result.breakdown.weeklyIncome) * 100
    : 0;

  const hasWarnings = result.explanation.warnings.length > 0;
  const hasCaps = result.explanation.capsApplied.length > 0;
  const hasAssumptions = result.explanation.assumptions.length > 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold font-display text-foreground">Your Leave Estimate</h2>
        <p className="text-muted-foreground">Based on {policyName} policy defaults.</p>
      </div>

      <Card className="border-l-8 border-l-primary shadow-xl">
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Estimated Income Gap
          </div>
          <div className="text-4xl font-bold font-display flex items-baseline gap-2">
            {formatCurrency(result.breakdown.savingsNeeded)}
            <span className="text-sm font-normal text-muted-foreground">
              total over {result.breakdown.totalWeeks} weeks
            </span>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-xl text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-1 rounded-full">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="font-bold text-primary">Weekly benefit estimate</span>
                <p className="mt-1">
                  {formatCurrency(result.breakdown.weeklyBenefit)} per week, about {Math.round(effectivePercent)}%
                  of your normal income.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BabyCostCard jurisdiction={jurisdiction} leaveWeeks={leaveWeeks} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Income vs Benefit</CardTitle>
            <CardDescription>Normal pay compared to paid leave benefit</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeBenefitChart
              income={Math.round(result.breakdown.weeklyIncome)}
              benefit={Math.round(result.breakdown.weeklyBenefit)}
            />
            <div className="mt-4 text-center text-sm font-medium">
              Weekly Gap: {formatCurrency(result.breakdown.weeklyIncome - result.breakdown.weeklyBenefit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave Timeline</CardTitle>
            <CardDescription>Paid and unpaid weeks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Leave</span>
              <span className="font-medium">{result.breakdown.totalWeeks} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid Weeks</span>
              <span className="font-medium text-primary">{result.breakdown.paidWeeks} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unpaid Weeks</span>
              <span className="font-medium">{result.breakdown.unpaidWeeks} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Income Gap</span>
              <span className="font-medium">{formatCurrency(result.breakdown.totalIncomeGap)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Explanation</CardTitle>
          <CardDescription>{result.explanation.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {narrationEnabled && <NarrationDisplay narration={narration} />}

          {hasAssumptions && (
            <div>
              <h4 className="font-semibold mb-2">Assumptions Applied</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {result.explanation.assumptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {hasCaps && (
            <div>
              <h4 className="font-semibold mb-2">Caps & Adjustments</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {result.explanation.capsApplied.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {hasWarnings && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Warnings
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {result.explanation.warnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Things to Double-Check</h4>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {result.explanation.thingsToDoubleCheck.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
