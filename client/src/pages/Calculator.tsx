import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, DollarSign, Home, ShoppingCart, 
  Baby, Zap, CreditCard, HeartPulse, RefreshCcw, Save, ShieldCheck
} from "lucide-react";
import { useCreatePlan } from "@/hooks/use-plans";
// Try relative path if @/ doesn't work
import { analytics } from "../lib/analytics";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "@/components/StepIndicator";
import { MoneyInput } from "@/components/MoneyInput";
import { GapChart, ScenarioChart } from "@/components/ResultCharts";
import { useToast } from "@/hooks/use-toast";

// Schema & Types
import type { CreatePlanInput } from "@shared/routes";

// --- WIZARD STEPS ---
const STEPS = ["Income", "Expenses", "Childcare", "Results"];

const DEFAULT_EXPENSES = {
  housing: 2000,
  utilities: 300,
  groceries: 800,
  insurance: 400,
  debt: 0,
  other: 500,
  baby: 500
};

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const { toast } = useToast();
  const createPlanMutation = useCreatePlan();

  // --- STATE ---
  const [formData, setFormData] = useState<CreatePlanInput>({
    annualSalary: 65000,
    leaveWeeks: 12,
    paidLeavePercent: 60,
    currentSavings: 5000,
    expenses: DEFAULT_EXPENSES,
    childcare: {
      type: "daycare_full",
      cost: 1400,
      returnOption: "fulltime"
    }
  });

  // --- HANDLERS ---
  const updateField = (field: keyof CreatePlanInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateExpense = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      expenses: { ...prev.expenses as any, [key]: value }
    }));
  };

  const updateChildcare = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      childcare: { ...prev.childcare as any, [key]: value }
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      // Track step completion before moving to next
      if (currentStep === 1) {
        analytics.step1Completed({
          salary: formData.annualSalary,
          leaveWeeks: formData.leaveWeeks,
          paidPercent: formData.paidLeavePercent
        });
      } else if (currentStep === 2) {
        const totalExpenses = Object.values(formData.expenses as Record<string, number>).reduce((a, b) => a + b, 0);
        analytics.step2Completed(totalExpenses);
      } else if (currentStep === 3) {
        analytics.step3Completed({
          childcareType: (formData.childcare as any).type,
          returnOption: (formData.childcare as any).returnOption
        });
      }

      setDirection(1);
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  };

  const handleSave = async () => {
    try {
      await createPlanMutation.mutateAsync(formData);
      toast({
        title: "Plan Saved!",
        description: "Your financial plan has been securely saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  // --- ANIMATION VARIANTS ---
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="font-bold text-xl tracking-tight font-display text-primary">LeaveCalc</Link>
            <Button variant="ghost" size="sm" onClick={() => {
              analytics.startOver();
              window.location.reload();
            }}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
          <StepIndicator currentStep={currentStep} totalSteps={4} />
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
              <IncomeStep data={formData} update={updateField} />
            )}
            {currentStep === 2 && (
              <ExpensesStep expenses={formData.expenses} update={updateExpense} />
            )}
            {currentStep === 3 && (
              <ChildcareStep data={formData.childcare} update={updateChildcare} />
            )}
            {currentStep === 4 && (
              <ResultsStep data={formData} onSave={handleSave} isSaving={createPlanMutation.isPending} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky Footer Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex gap-4">
          {currentStep > 1 && (
            <Button variant="outline" size="lg" className="flex-1" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {currentStep < 4 ? (
            <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90" onClick={nextStep}>
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" className="flex-1 bg-success hover:bg-success/90 text-white" onClick={handleSave} disabled={createPlanMutation.isPending}>
              {createPlanMutation.isPending ? "Saving..." : "Save Plan"} <Save className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS FOR STEPS ---

function IncomeStep({ data, update }: { data: CreatePlanInput, update: any }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground">Let's talk income.</h2>
        <p className="text-muted-foreground mt-2">We'll use this to calculate your leave gap.</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-base">Annual Salary (Pre-tax)</Label>
            <MoneyInput 
              value={data.annualSalary} 
              onValueChange={(val) => update('annualSalary', val)}
              className="text-lg h-14"
            />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between">
              <Label className="text-base">Leave Duration</Label>
              <span className="font-bold text-primary">{data.leaveWeeks} weeks</span>
            </div>
            <Slider 
              value={[data.leaveWeeks]} 
              onValueChange={(val) => update('leaveWeeks', val[0])}
              min={0} max={26} step={1} 
            />
            <p className="text-xs text-muted-foreground">Most US employers offer 6-12 weeks.</p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between">
              <Label className="text-base">Paid Leave %</Label>
              <span className="font-bold text-primary">{data.paidLeavePercent}%</span>
            </div>
            <Slider 
              value={[data.paidLeavePercent]} 
              onValueChange={(val) => update('paidLeavePercent', val[0])}
              min={0} max={100} step={5} 
            />
          </div>

          <div className="space-y-2 pt-4">
            <Label className="text-base">Current Savings (Optional)</Label>
            <MoneyInput 
              value={data.currentSavings ?? 0} 
              onValueChange={(val) => update('currentSavings', val)}
              className="text-lg h-14"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpensesStep({ expenses, update }: { expenses: any, update: any }) {
  const categories = [
    { key: 'housing', label: 'Housing', icon: Home },
    { key: 'utilities', label: 'Utilities', icon: Zap },
    { key: 'groceries', label: 'Groceries', icon: ShoppingCart },
    { key: 'insurance', label: 'Insurance', icon: HeartPulse },
    { key: 'debt', label: 'Debt Payments', icon: CreditCard },
    { key: 'baby', label: 'Baby Costs', icon: Baby },
  ];

  const total = Object.values(expenses).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-display text-foreground">Monthly Expenses</h2>
        <p className="text-muted-foreground mt-2">Adjust defaults to match your reality.</p>
        <div className="mt-4 inline-block bg-secondary/10 px-4 py-2 rounded-full">
          <span className="font-semibold text-secondary">Total: ${total.toLocaleString()}/mo</span>
        </div>
      </div>

      <div className="grid gap-4">
        {categories.map((cat) => (
          <Card key={cat.key} className="overflow-hidden">
            <div className="flex items-center p-4">
              <div className="bg-primary/10 p-3 rounded-xl mr-4">
                <cat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground block mb-1">{cat.label}</Label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold">$</span>
                  <input 
                    type="number"
                    value={expenses[cat.key]}
                    onChange={(e) => update(cat.key, parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 font-bold text-lg bg-transparent border-none focus:outline-none p-0"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChildcareStep({ data, update }: { data: any, update: any }) {
  const childcareTypes = [
    { id: 'daycare_full', label: 'Daycare (Full-time)', cost: 1400 },
    { id: 'nanny_full', label: 'Nanny (Full-time)', cost: 3000 },
    { id: 'nanny_share', label: 'Nanny Share', cost: 1800 },
    { id: 'family', label: 'Family / Free', cost: 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-display text-foreground">Return to Work</h2>
        <p className="text-muted-foreground mt-2">Childcare is likely your biggest new expense.</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Childcare Plan</Label>
          <select 
            className="w-full h-12 rounded-xl border border-input px-3 bg-background"
            value={data.type}
            onChange={(e) => {
              const type = childcareTypes.find(t => t.id === e.target.value);
              update('type', e.target.value);
              if (type) update('cost', type.cost);
            }}
          >
            {childcareTypes.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-base">Estimated Monthly Cost</Label>
          <MoneyInput 
            value={data.cost}
            onValueChange={(val) => update('cost', val)}
          />
        </div>
      </Card>

      <div className="space-y-4">
        <Label className="text-base pl-1">Return Scenario Preference</Label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'fulltime', label: 'Full-time Return', desc: '40hrs / week' },
            { id: 'parttime_30', label: 'Part-time', desc: '30hrs / week' },
            { id: 'parttime_20', label: 'Part-time', desc: '20hrs / week' },
          ].map((option) => (
            <div 
              key={option.id}
              onClick={() => update('returnOption', option.id)}
              className={`
                cursor-pointer p-4 rounded-xl border-2 transition-all flex justify-between items-center
                ${data.returnOption === option.id 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border bg-card hover:border-primary/30'}
              `}
            >
              <div>
                <div className="font-bold text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.desc}</div>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${data.returnOption === option.id ? 'border-primary' : 'border-muted-foreground'}
              `}>
                {data.returnOption === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsStep({ data, onSave, isSaving }: { data: CreatePlanInput, onSave: () => void, isSaving: boolean }) {
  // Calculations
  const monthlySalary = data.annualSalary / 12;
  const monthlyLeaveIncome = (data.annualSalary * (data.paidLeavePercent / 100)) / 12;
  
  const totalExpenses = Object.values(data.expenses as Record<string, number>).reduce((a, b) => a + b, 0);
  
  const monthlyGap = monthlyLeaveIncome - totalExpenses;
  const totalLeaveMonths = data.leaveWeeks / 4.33;
  const cumulativeGap = monthlyGap * totalLeaveMonths;
  const savingsNeeded = cumulativeGap < 0 ? Math.abs(cumulativeGap) : 0;
  
  const surplus = (data.currentSavings ?? 0) - savingsNeeded;
  const canAfford = surplus >= 0;

  // Track results view
  useState(() => {
    analytics.resultsViewed(savingsNeeded);
  });

  // Scenarios
  const childcareCost = (data.childcare as any).cost;
  const scenarios = [
    { name: 'Full-time', netIncome: monthlySalary - totalExpenses - childcareCost, isCurrent: (data.childcare as any).returnOption === 'fulltime' },
    { name: 'PT (30h)', netIncome: (monthlySalary * 0.75) - totalExpenses - (childcareCost * 0.8), isCurrent: (data.childcare as any).returnOption === 'parttime_30' },
    { name: 'PT (20h)', netIncome: (monthlySalary * 0.5) - totalExpenses - (childcareCost * 0.6), isCurrent: (data.childcare as any).returnOption === 'parttime_20' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold font-display text-foreground">Your Plan</h2>
        <p className="text-muted-foreground">Here is the breakdown of your leave finances.</p>
      </div>

      {/* Hero Insight Card */}
      <Card className={`border-l-8 ${canAfford ? 'border-l-success' : 'border-l-destructive'} shadow-xl`}>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Savings Needed for Leave
          </div>
          <div className="text-4xl font-bold font-display flex items-baseline gap-2">
            ${Math.round(savingsNeeded).toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">
              total for {data.leaveWeeks} weeks
            </span>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-xl text-sm">
            {canAfford ? (
              <div className="flex items-start gap-3">
                <div className="bg-success/20 p-1 rounded-full"><ShieldCheck className="w-5 h-5 text-success" /></div>
                <div>
                  <span className="font-bold text-success">You are covered!</span>
                  <p className="mt-1">Your current savings of ${(data.currentSavings ?? 0).toLocaleString()} covers the gap with ${surplus.toLocaleString()} to spare.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                 <div className="bg-destructive/10 p-1 rounded-full"><DollarSign className="w-5 h-5 text-destructive" /></div>
                 <div>
                   <span className="font-bold text-destructive">Shortfall Warning</span>
                   <p className="mt-1">You need an additional <span className="font-bold">${Math.abs(surplus).toLocaleString()}</span> in savings before your leave starts.</p>
                 </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gap Visualization */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Cash Flow</CardTitle>
            <CardDescription>Income vs Expenses during leave</CardDescription>
          </CardHeader>
          <CardContent>
             <GapChart 
               income={Math.round(monthlyLeaveIncome)} 
               expenses={Math.round(totalExpenses)} 
               gap={Math.round(monthlyGap)} 
             />
             <div className="mt-4 text-center text-sm font-medium">
               Net Monthly: <span className={monthlyGap >= 0 ? 'text-success' : 'text-destructive'}>
                 {monthlyGap >= 0 ? '+' : '-'}${Math.abs(Math.round(monthlyGap)).toLocaleString()}
               </span>
             </div>
          </CardContent>
        </Card>

        {/* Return Scenarios */}
        <Card>
          <CardHeader>
             <CardTitle className="text-lg">Return Scenarios</CardTitle>
             <CardDescription>Net income after childcare</CardDescription>
          </CardHeader>
          <CardContent>
             <ScenarioChart scenarios={scenarios} />
          </CardContent>
        </Card>
      </div>
      
      {/* Detail List */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Monthly Salary (Normal)</span>
            <span className="font-medium">${Math.round(monthlySalary).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Monthly Leave Pay ({data.paidLeavePercent}%)</span>
            <span className="font-medium text-primary">${Math.round(monthlyLeaveIncome).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Total Monthly Expenses</span>
            <span className="font-medium text-secondary">-${Math.round(totalExpenses).toLocaleString()}</span>
          </div>
           <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Est. Childcare Cost</span>
            <span className="font-medium">-${childcareCost.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}