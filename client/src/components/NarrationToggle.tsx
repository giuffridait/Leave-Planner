import { setNarrationOverride } from "@/lib/featureFlags";

interface NarrationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function NarrationToggle({ enabled, onToggle }: NarrationToggleProps) {
  const handleToggle = () => {
    const nextValue = !enabled;
    setNarrationOverride(nextValue);
    onToggle(nextValue);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
      <div className="flex-1">
        <label htmlFor="narration-toggle" className="text-sm font-medium">
          Friendly AI explanation
        </label>
        <p className="text-xs text-muted-foreground">
          Experimental: rewrites the explanation into natural language.
        </p>
      </div>
      <input
        id="narration-toggle"
        type="checkbox"
        checked={enabled}
        onChange={handleToggle}
        className="h-4 w-4 rounded border-gray-300"
      />
    </div>
  );
}
