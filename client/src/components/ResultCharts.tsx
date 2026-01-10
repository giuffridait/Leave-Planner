import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface GapChartProps {
  income: number;
  expenses: number;
  gap: number;
}

export function GapChart({ income, expenses, gap }: GapChartProps) {
  const data = [
    { name: 'Income', value: income, fill: '#4A90E2' },
    { name: 'Expenses', value: expenses, fill: '#F5A623' },
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface Scenario {
  name: string;
  netIncome: number;
  isCurrent: boolean;
}

export function ScenarioChart({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={scenarios} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" tick={{fontSize: 12}} />
          <YAxis tickFormatter={(val) => `$${val}`} tick={{fontSize: 12}} />
          <Tooltip 
             formatter={(value) => [`$${value}`, "Net Monthly Income"]}
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="netIncome" radius={[10, 10, 0, 0]}>
            {scenarios.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#4A90E2' : '#E2E8F0'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
