"use client";
import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinancials } from '@/context/financial-context';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionList } from '@/components/transaction-list';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId as string;
  const { accounts, transactions, formatCurrency, loading } = useFinancials();

  const account = useMemo(() => accounts.find(acc => acc.id === accountId), [accounts, accountId]);

  const accountTransactions = useMemo(() => {
    return transactions.filter(t => t.accountId === accountId);
  }, [transactions, accountId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!account) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Account not found</h2>
            <p className="text-muted-foreground mt-2">The account you are looking for does not exist.</p>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title={account.name} description={account.type}>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Accounts
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className={`text-2xl font-bold ${account.type === 'Credit Card' ? 'text-destructive' : ''}`}>
                    {formatCurrency(account.balance)}
                </span>
            </div>
            {account.type === 'Credit Card' && (
                <>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Credit Limit</span>
                        <span className="text-2xl font-bold">{formatCurrency(account.creditLimit || 0)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Available Credit</span>
                        <span className="text-2xl font-bold">{formatCurrency((account.creditLimit || 0) + account.balance)}</span>
                    </div>
                </>
            )}
        </CardContent>
      </Card>

      <TransactionList transactions={accountTransactions} />
    </div>
  );
}
