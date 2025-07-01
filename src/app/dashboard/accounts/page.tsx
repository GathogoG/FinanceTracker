"use client";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { PageHeader } from "@/components/page-header";
import { useFinancials } from "@/context/financial-context";
import { AccountListCard } from "@/components/account-list-card";
import { useMemo } from "react";
import { PayBillDialog } from "@/components/pay-bill-dialog";

export default function AccountsPage() {
  const { accounts } = useFinancials();

  const { bankAccounts, creditCards, cashAccounts } = useMemo(() => {
    const bankAccounts = accounts.filter(
      (acc) => acc.type === "Bank Account"
    );
    const creditCards = accounts.filter((acc) => acc.type === "Credit Card");
    const cashAccounts = accounts.filter((acc) => acc.type === "Cash");
    return { bankAccounts, creditCards, cashAccounts };
  }, [accounts]);

  return (
    <div className="space-y-8">
      <PageHeader title="All Accounts">
        <PayBillDialog />
        <AddAccountDialog />
      </PageHeader>
      <div className="space-y-6">
        {bankAccounts.length > 0 && (
          <AccountListCard title="Bank Accounts" accounts={bankAccounts} />
        )}
        {creditCards.length > 0 && (
          <AccountListCard title="Credit Cards" accounts={creditCards} />
        )}
        {cashAccounts.length > 0 && (
          <AccountListCard title="In-Hand Cash" accounts={cashAccounts} />
        )}
         {accounts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-12 text-center">
            <h3 className="text-xl font-semibold tracking-tight">No accounts yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Add Account" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
