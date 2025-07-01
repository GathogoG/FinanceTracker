"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useFinancials, Lent } from "@/context/financial-context";
import { Button } from './ui/button';
import { SettleLentDialog } from './settle-lent-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, HandCoins } from 'lucide-react';

interface LendingListProps {
  status: 'outstanding' | 'settled';
}

export function LendingList({ status }: LendingListProps) {
  const { lent, formatCurrency } = useFinancials();
  const [lentToSettle, setLentToSettle] = useState<Lent | null>(null);

  const filteredLent = lent.filter(l => l.status === status);

  const title = status === 'outstanding' ? 'Outstanding Loans' : 'Settled Loans';
  const description = status === 'outstanding' 
    ? "Money that is owed to you."
    : "Loans that have been paid back.";
  
  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLent.length > 0 ? (
            <div className="divide-y">
              {filteredLent.map((item) => (
                <Collapsible key={item.id}>
                    <div className="flex items-center p-4">
                        <div className="flex-1 space-y-1">
                            <p className="font-semibold">{item.borrower}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <p>Owed: <span className="font-medium text-foreground">{formatCurrency(item.originalAmount)}</span></p>
                                {status === 'outstanding' && (
                                    <p>Remaining: <span className="font-medium text-destructive">{formatCurrency(item.remainingAmount)}</span></p>
                                )}
                                {status === 'settled' && item.settledDate && (
                                    <p>Settled: <span className="font-medium text-green-600">{new Date(item.settledDate).toLocaleDateString()}</span></p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            {item.settlements?.length > 0 && (
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        History
                                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                    </Button>
                                </CollapsibleTrigger>
                            )}
                            {status === 'outstanding' && (
                                <Button variant="outline" size="sm" onClick={() => setLentToSettle(item)}>
                                    Settle
                                </Button>
                            )}
                        </div>
                    </div>
                    <CollapsibleContent>
                        <div className="px-4 pb-4 pl-14 bg-muted/50">
                            <h4 className="text-sm font-semibold mb-2 pt-4">Payment History</h4>
                            <div className="space-y-2">
                                {item.settlements?.map(s => (
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
                {status === 'outstanding' ? 'No outstanding loans' : 'No settled loans'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {status === 'outstanding' ? 'Use the "Lend Money" or "Split Expense" features to record money owed to you.' : 'Settle an outstanding loan to see it here.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
       {lentToSettle && (
        <SettleLentDialog 
            lent={lentToSettle}
            isOpen={!!lentToSettle}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setLentToSettle(null);
                }
            }}
        />
      )}
    </>
  )
}
