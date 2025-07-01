"use client";
import { useFinancials } from "@/context/financial-context";
import { TransactionList } from "./transaction-list";
import { useMemo } from "react";

export function RecentTransactions() {
  const { transactions } = useFinancials();

  const recentTransactions = useMemo(() => {
    // The transactions are already sorted by date descending from the context
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <TransactionList 
        transactions={recentTransactions} 
        title="Recent Transactions"
        description="Your last 5 transactions."
    />
  );
}
