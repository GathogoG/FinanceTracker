"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFinancials, Lent, Account } from '@/context/financial-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

interface SettleLentDialogProps {
    lent: Lent;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function SettleLentDialog({ lent, isOpen, onOpenChange }: SettleLentDialogProps) {
  const { toast } = useToast();
  const [toAccountId, setToAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { settleLent, accounts, formatCurrency } = useFinancials();
  
  const [isPartial, setIsPartial] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  const paymentAccounts = accounts.filter(acc => acc.type === 'Bank Account' || acc.type === 'Cash');

  useEffect(() => {
    setIsPartial(false);
    setPaymentAmount('');
    setAmountError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isPartial) {
      setAmountError(null);
      return;
    }
    const numericAmount = parseFloat(paymentAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        setAmountError("Please enter a valid amount.");
        return;
    }
    if (numericAmount > lent.remainingAmount) {
        setAmountError("Amount cannot be more than the remaining balance.");
        return;
    }
    setAmountError(null);
  }, [paymentAmount, lent.remainingAmount, isPartial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPaymentAmount = isPartial ? parseFloat(paymentAmount) : lent.remainingAmount;

    if (!toAccountId || isNaN(finalPaymentAmount) || finalPaymentAmount <= 0) {
      toast({ title: "Error", description: "Please fill all fields correctly.", variant: "destructive" });
      return;
    }
    if (amountError) {
      toast({ title: "Validation Error", description: amountError, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await settleLent(lent.id, toAccountId, isPartial ? finalPaymentAmount : undefined);

      toast({
        title: "Payment Recorded",
        description: `Payment from ${lent.borrower} has been successful.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Error", description: `Failed to record payment: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Receive Payment from {lent.borrower}</DialogTitle>
            <DialogDescription>
              Remaining balance: <span className="font-bold text-foreground">{formatCurrency(lent.remainingAmount)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="toAccount" className="text-right">
                Deposit To
              </Label>
              <Select onValueChange={setToAccountId} value={toAccountId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{`${acc.name} (${formatCurrency(acc.balance)})`}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <div/>
                <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox id="is-partial" checked={isPartial} onCheckedChange={(checked) => {
                        setIsPartial(checked as boolean);
                        setPaymentAmount('');
                    }} />
                    <label htmlFor="is-partial" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Receive partial payment</label>
                </div>
            </div>
             {isPartial && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className={cn("col-span-3", amountError && "border-destructive focus-visible:ring-destructive")}
                        placeholder="e.g., 50.00"
                    />
                </div>
            )}
             {amountError && (
                <div className="grid grid-cols-4 items-center gap-4 -mt-2">
                    <div />
                    <p className="col-span-3 text-sm text-destructive">{amountError}</p>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !!amountError}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Processing...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
