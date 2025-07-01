"use client";
import { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useFinancials } from "@/context/financial-context";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

export function InvestmentSummaryCard() {
  const { investments, formatCurrency, loading } = useFinancials();

  const { totalValue, totalGain, totalGainPercent, isPositive } = useMemo(() => {
    if (investments.length === 0) {
      return { totalValue: 0, totalGain: 0, totalGainPercent: 0, isPositive: true };
    }
    const totalValue = investments.reduce(
      (sum, inv) => sum + inv.currentValue,
      0
    );
    const totalPurchaseValue = investments.reduce(
      (sum, inv) => sum + inv.purchaseValue,
      0
    );
    const totalGain = totalValue - totalPurchaseValue;
    const totalGainPercent =
      totalPurchaseValue > 0 ? (totalGain / totalPurchaseValue) * 100 : 0;
    
    return {
      totalValue,
      totalGain,
      totalGainPercent,
      isPositive: totalGain >= 0
    };
  }, [investments]);

  if (loading && investments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
           <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
           </div>
        </CardContent>
      </Card>
    );
  }
  
  if (investments.length === 0) {
    return null; // Don't show the card if there are no investments
  }


  return (
    <Card>
      <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Portfolio Value
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Return</p>
              <div
                className={cn(
                  "flex items-center text-lg font-semibold",
                  isPositive ? "text-green-500" : "text-destructive"
                )}
              >
                {isPositive ? (
                  <ArrowUp className="h-5 w-5 mr-1" />
                ) : (
                  <ArrowDown className="h-5 w-5 mr-1" />
                )}
                <span>
                  {formatCurrency(totalGain)} ({totalGainPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
