import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SeverityDistributionChartProps {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

const COLORS = {
  critical: "hsl(0 85% 60%)",
  high: "hsl(35 95% 55%)",
  medium: "hsl(35 95% 55%)",
  low: "hsl(210 85% 60%)",
};

export function SeverityDistributionChart({
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
}: SeverityDistributionChartProps) {
  const data = [
    { name: "Critical", value: criticalCount, color: COLORS.critical },
    { name: "High", value: highCount, color: COLORS.high },
    { name: "Medium", value: mediumCount, color: COLORS.medium },
    { name: "Low", value: lowCount, color: COLORS.low },
  ].filter((item) => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
