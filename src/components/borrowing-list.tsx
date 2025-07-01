"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useFinancials, Borrow } from "@/context/financial-context";
import { Button } from './ui/button';
import { SettleBorrowDialog } from './settle-borrow-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, HandCoins } from 'lucide-react';

interface BorrowingListProps {
  status: 'outstanding' | 'settled';
}

export function BorrowingList({ status }: BorrowingListProps) {
  const { borrows, formatCurrency } = useFinancials();
  const [borrowToSettle, setBorrowToSettle] = useState<Borrow | null>(null);

  const filteredBorrows = borrows.filter(b => b.status === status);

  const title = status === 'outstanding' ? 'Outstanding Debts' : 'Settled Debts';
  const description = status === 'outstanding' 
    ? "Money you need to pay back."
    : "Debts you have already paid off.";
  
  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBorrows.length > 0 ? (
            <div className="divide-y">
              {filteredBorrows.map((borrow) => (
                <Collapsible key={borrow.id}>
                    <div className="flex items-center p-4">
                        <div className="flex-1 space-y-1">
                            <p className="font-semibold">{borrow.lender}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <p>Borrowed: <span className="font-medium text-foreground">{formatCurrency(borrow.originalAmount)}</span></p>
                                {status === 'outstanding' && (
                                    <p>Remaining: <span className="font-medium text-destructive">{formatCurrency(borrow.remainingAmount)}</span></p>
                                )}
                                {status === 'settled' && borrow.settledDate && (
                                    <p>Settled: <span className="font-medium text-green-600">{new Date(borrow.settledDate).toLocaleDateString()}</span></p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            {borrow.settlements?.length > 0 && (
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        History
                                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                    </Button>
                                </CollapsibleTrigger>
                            )}
                            {status === 'outstanding' && (
                                <Button variant="outline" size="sm" onClick={() => setBorrowToSettle(borrow)}>
                                    Pay
                                </Button>
                            )}
                        </div>
                    </div>
                    <CollapsibleContent>
                        <div className="px-4 pb-4 pl-14 bg-muted/50">
                            <h4 className="text-sm font-semibold mb-2 pt-4">Payment History</h4>
                            <div className="space-y-2">
                                {borrow.settlements?.map(s => (
                                <div key={s.id} className="flex items-center text-sm">
                                    <HandCoins className="h-4 w-4 mr-3 text-muted-foreground"/>
                                    <div className="flex-1">
                                        <p>Payment on {new Date(s.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="font-mono">{formatCurrency(s.amount)}</p>
                                </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card m-4 p-12 text-center">
              <h3 className="text-xl font-semibold tracking-tight">
                {status === 'outstanding' ? 'No outstanding debts' : 'No settled debts'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {status === 'outstanding' ? 'Use the "Add Income" feature to record borrowed money.' : 'Settle an outstanding debt to see it here.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
       {borrowToSettle && (
        <SettleBorrowDialog 
            borrow={borrowToSettle}
            isOpen={!!borrowToSettle}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setBorrowToSettle(null);
                }
            }}
        />
      )}
    </>
  )
}
