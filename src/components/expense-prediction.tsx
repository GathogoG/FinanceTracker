"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useFinancials } from '@/context/financial-context';
import { predictFutureExpenses } from '@/ai/flows/predict-future-expenses';
import { Skeleton } from './ui/skeleton';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';

const chartConfig = {
  predicted: {
    label: "Predicted Expenses",
    color: "hsl(var(--chart-4))",
  },
}

export function ExpensePrediction() {
  const { transactions, formatCurrency, currency } = useFinancials();
  const [chartData, setChartData] = useState<{ month: string, predicted: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const pastSpendingData = useMemo(() => {
      return transactions
        .filter(t => t.amount < 0)
        .map(t => `${t.date}: ${t.description} - ${t.category} - ${formatCurrency(t.amount)}`)
        .join('\n');
  }, [transactions, formatCurrency]);

  useEffect(() => {
      const getPrediction = async () => {
          setLoading(true);
          try {
              const result = await predictFutureExpenses({
                  pastSpendingData,
                  predictionHorizon: '6 months',
              });

              if (result.predictedExpenses && result.predictedExpenses.length > 0) {
                  setChartData(result.predictedExpenses);
              } else {
                  setChartData([]);
              }
          } catch (e) {
              console.error("Failed to predict future expenses:", e);
              setChartData([]);
          }
          setLoading(false);
      }
      if (transactions.filter(t => t.amount < 0).length > 0) {
        getPrediction();
      } else {
        setLoading(false);
        setChartData([]);
      }
  }, [pastSpendingData, transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Prediction</CardTitle>
        <CardDescription>AI-powered forecast for the next 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="p-4">
                <Skeleton className="h-[200px] w-full" />
            </div>
        ) : chartData.length > 0 ? (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 3)}
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
              dataKey="predicted"
              type="monotone"
              stroke="var(--color-predicted)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
        ) : (
          <div className="min-h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Not enough data to predict expenses.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
