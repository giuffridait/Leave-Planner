import { Sparkles } from "lucide-react";
import type { NarrationResult } from "@/domain/narration/types";

interface NarrationDisplayProps {
  narration?: NarrationResult;
}

export function NarrationDisplay({ narration }: NarrationDisplayProps) {
  if (!narration) {
    return null;
  }

  if (!narration.success || !narration.narration) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-blue-500 p-1">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">AI Explanation</h3>
          <p className="mt-2 text-sm text-blue-800">{narration.narration.friendlySummary}</p>
        </div>
      </div>

      {narration.narration.whatDroveTheGap.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-900">What drove the income gap:</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            {narration.narration.whatDroveTheGap.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {narration.narration.thingsToDoubleCheck.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-900">Things to double-check:</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            {narration.narration.thingsToDoubleCheck.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {narration.validationIssues && narration.validationIssues.length > 0 && (
        <details className="text-xs text-blue-700">
          <summary className="cursor-pointer">Validation warnings</summary>
          <ul className="mt-1 space-y-1 pl-4">
            {narration.validationIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
