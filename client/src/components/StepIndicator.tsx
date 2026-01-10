import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-secondary/10 h-2 mb-8">
      <motion.div
        className="h-full bg-secondary rounded-r-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground px-1">
        <span>Step {currentStep}</span>
        <span>of {totalSteps}</span>
      </div>
    </div>
  );
}
