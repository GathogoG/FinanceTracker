"use client"
import { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useFinancials } from "@/context/financial-context"
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils"

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function FinancialSummaryCard() {
  const { transactions, formatCurrency, currency } = useFinancials();

  const chartData = useMemo(() => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyData: { [key: string]: { month: string, income: number, expenses: number }} = {};

    transactions.filter(t => t.category !== 'Transfer').forEach(t => {
      const date = new Date(t.date);
      if (isNaN(date.getTime())) return;

      const monthIndex = date.getMonth();
      const monthName = monthNames[monthIndex];
      const year = date.getFullYear();
      const key = `${year}-${monthIndex.toString().padStart(2, '0')}`;

      if (!monthlyData[key]) {
        monthlyData[key] = { month: monthName, income: 0, expenses: 0 };
      }

      const amount = t.amount;
      if (amount > 0) {
        monthlyData[key].income += amount;
      } else {
        monthlyData[key].expenses += Math.abs(amount);
      }
    });

    return Object.entries(monthlyData)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .slice(-6)
        .map(([, value]) => value);
  }, [transactions]);
  
  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const lastMonth = chartData[chartData.length - 1];
    const secondLastMonth = chartData[chartData.length - 2];
    const lastMonthSavings = lastMonth.income - lastMonth.expenses;
    const secondLastMonthSavings = secondLastMonth.income - secondLastMonth.expenses;

    if (secondLastMonthSavings === 0) {
        return lastMonthSavings > 0 ? 100 : 0;
    }

    const change = ((lastMonthSavings - secondLastMonthSavings) / Math.abs(secondLastMonthSavings)) * 100;
    return isFinite(change) ? change : 0;
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
        <CardDescription>
          {chartData.length > 0 
            ? `Income vs. Expenses for ${chartData[0].month} - ${chartData[chartData.length - 1].month}`
            : "No data available for chart"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrencyUtil(value as number, currency).replace(/\.00$/, '')}
             />
            <ChartTooltip 
              content={<ChartTooltipContent formatter={(value, name) => <div>{`${chartConfig[name as keyof typeof chartConfig].label}: ${formatCurrency(value as number)}`}</div>} />} 
              />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Savings trend is {trend >= 0 ? "up" : "down"} by {Math.abs(trend).toFixed(1)}% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total income and expenses for the last {chartData.length} months
        </div>
      </CardFooter>
    </Card>
  )
}
