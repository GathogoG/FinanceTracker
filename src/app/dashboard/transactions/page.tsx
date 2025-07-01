"use client";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { AddIncomeDialog } from "@/components/add-income-dialog";
import { AddLendMoneyDialog } from "@/components/add-lend-money-dialog";
import { AddTransferDialog } from "@/components/add-transfer-dialog";
import { PageHeader } from "@/components/page-header";
import { TransactionList } from "@/components/transaction-list";
import { useFinancials } from "@/context/financial-context";

export default function TransactionsPage() {
  const { transactions } = useFinancials();

  return (
    <div className="space-y-8">
       <PageHeader title="Transactions">
        <AddIncomeDialog />
        <AddTransferDialog />
        <AddLendMoneyDialog />
        <AddExpenseDialog />
      </PageHeader>
      <TransactionList transactions={transactions} />
    </div>
  );
}
