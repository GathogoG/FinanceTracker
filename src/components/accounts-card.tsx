"use client";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useFinancials } from "@/context/financial-context";

export function AccountsCard() {
  const { accounts, formatCurrency } = useFinancials();

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, account) => acc + account.balance, 0);
  }, [accounts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Your connected accounts</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts added yet.</p>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full">{account.icon}</div>
              <div className="flex-1">
                <p className="font-semibold">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.type}</p>
              </div>
              <div className={`font-semibold ${account.type === 'Credit Card' ? 'text-destructive' : ''}`}>
                {formatCurrency(account.balance)}
              </div>
            </div>
          ))
        )}
      </CardContent>
      {accounts.length > 0 && (
        <CardFooter className="pt-4 mt-4 border-t">
          <div className="flex justify-between w-full">
            <span className="font-semibold">Total Net Worth</span>
            <span className="font-semibold">{formatCurrency(totalBalance)}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
