"use client"
import React, { useState, useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useFinancials } from '@/context/financial-context';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from './ui/skeleton';

const chartConfig = {
  netWorth: {
    label: "Net Worth",
    color: "hsl(var(--chart-1))",
  },
}

export function NetWorthChart() {
  const { accounts, transactions, formatCurrency, loading: financialsLoading } = useFinancials();
  const [timeframe, setTimeframe] = useState('monthly'); // 'monthly' or 'yearly'

  const chartData = useMemo(() => {
    if (financialsLoading || !accounts.length) return [];

    // Net worth is now just account balances
    const currentNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let data = [];
    let historicalNetWorth = currentNetWorth;
    const now = new Date();

    if (timeframe === 'monthly') {
      let currentTransactionIndex = sortedTransactions.length - 1;

      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = `${date.toLocaleString('default', { month: 'short' })} '${String(date.getFullYear()).slice(2)}`;
        
        const monthEndNetWorth = historicalNetWorth;
        data.unshift({ date: monthName, netWorth: monthEndNetWorth });

        while(currentTransactionIndex >= 0 && new Date(sortedTransactions[currentTransactionIndex].date) >= date) {
           const t = sortedTransactions[currentTransactionIndex];
           if (t.category !== 'Transfer') {
             historicalNetWorth -= t.amount;
           }
           currentTransactionIndex--;
        }
      }
    } else { // yearly
      let currentTransactionIndex = sortedTransactions.length - 1;
      const currentYear = now.getFullYear();

      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const yearEndNetWorth = historicalNetWorth;
        data.unshift({ date: String(year), netWorth: yearEndNetWorth });
        
        while(currentTransactionIndex >= 0 && new Date(sortedTransactions[currentTransactionIndex].date).getFullYear() >= year) {
           const t = sortedTransactions[currentTransactionIndex];
            if (t.category !== 'Transfer') {
             historicalNetWorth -= t.amount;
           }
           currentTransactionIndex--;
        }
      }
    }
    
    return data;
  }, [accounts, transactions, timeframe, financialsLoading]);


  const isLoading = financialsLoading && chartData.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle>Net Worth</CardTitle>
                <CardDescription>Your financial growth over time (based on accounts).</CardDescription>
            </div>
            <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="p-4">
                <Skeleton className="h-[250px] w-full" />
            </div>
        ) : chartData.length > 0 ? (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 5,
              bottom: 5
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrency(value as number).replace(/\.00$/, '')}
            />
            <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent 
                formatter={(value) => formatCurrency(value as number)}
                indicator="dot" />} 
            />
            <Line
              dataKey="netWorth"
              type="monotone"
              stroke="var(--color-netWorth)"
              strokeWidth={2}
              dot={{
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
        ) : (
          <div className="min-h-[250px] flex items-center justify-center p-4 text-center">
            <p className="text-muted-foreground">You don't have enough transaction history to display a net worth chart yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
