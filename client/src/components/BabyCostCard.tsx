import { ShoppingCart, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBabyCosts } from "@/hooks/use-baby-costs";

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

interface BabyCostCardProps {
  jurisdiction: string;
  leaveWeeks: number;
}

export function BabyCostCard({ jurisdiction, leaveWeeks }: BabyCostCardProps) {
  const { data, isLoading, isError } = useBabyCosts(jurisdiction, leaveWeeks);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          Baby Product Costs
        </CardTitle>
        <CardDescription>
          Estimated recurring monthly spend for essential baby products
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Fetching current prices…
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 text-sm text-destructive py-4">
            <AlertCircle className="w-4 h-4" />
            Could not load price data — showing estimates.
          </div>
        )}

        {data && (
          <div className="space-y-3 text-sm">
            {data.lines.map((line) => (
              <div key={line.category}>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(line.monthlyEstimate)}/mo
                  </span>
                </div>
                {line.note && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{line.note}</p>
                )}
              </div>
            ))}

            <div className="border-t pt-3 mt-2 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Total monthly</span>
                <span className="tabular-nums">{formatCurrency(data.totalMonthly)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Over {data.leaveMonths} months</span>
                <span className="tabular-nums font-medium text-foreground">
                  {formatCurrency(data.totalForLeave)}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/60 pt-1">
              {data.source === "google-cse"
                ? `Prices from Google Shopping${data.pricedAt ? ` · updated ${new Date(data.pricedAt).toLocaleDateString()}` : ""}`
                : "Based on national averages — enable Google CSE for live prices"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
