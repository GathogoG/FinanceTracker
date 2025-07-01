"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';
import { Loader2, HandCoins } from 'lucide-react';
import { useFinancials } from '@/context/financial-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatCurrency } from '@/lib/utils';

export function AddLendMoneyDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [borrower, setBorrower] = useState('');
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addLentMoney, accounts, currency: userCurrency } = useFinancials();

  const sourceAccounts = accounts.filter(acc => acc.type === 'Bank Account' || acc.type === 'Cash');

  const resetForm = () => {
    setBorrower('');
    setAmount('');
    setFromAccountId('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrower || !amount || !fromAccountId) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    const numericAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccountId);
    if (sourceAccount && numericAmount > sourceAccount.balance) {
      toast({ title: "Error", description: "Insufficient balance in source account.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addLentMoney({
          borrower,
          amount: numericAmount,
          fromAccountId,
      });

      toast({
        title: "Loan Recorded",
        description: `Your loan to ${borrower} has been recorded.`,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Error",
        description: `Failed to record loan: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-9 gap-1">
          <HandCoins className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Lend Money
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Lend Money</DialogTitle>
            <DialogDescription>
              Record a direct loan to someone from one of your accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="borrower" className="text-right">
                To
              </Label>
              <Input
                id="borrower"
                value={borrower}
                onChange={(e) => setBorrower(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 50.00"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fromAccount" className="text-right">
                From
              </Label>
              <Select onValueChange={setFromAccountId} value={fromAccountId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{`${acc.name} (${formatCurrency(acc.balance, userCurrency)})`}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Processing...' : 'Record Loan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
