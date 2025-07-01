"use client"
import React, { useState, useMemo } from 'react';
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
import { Loader2, Receipt } from 'lucide-react';
import { useFinancials } from '@/context/financial-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function PayBillDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [creditCardId, setCreditCardId] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { payBill, accounts, formatCurrency } = useFinancials();

  const creditCards = useMemo(() => accounts.filter(acc => acc.type === 'Credit Card'), [accounts]);
  const sourceAccounts = useMemo(() => accounts.filter(acc => acc.type === 'Checking' || acc.type === 'Savings'), [accounts]);
  const selectedCreditCard = useMemo(() => accounts.find(acc => acc.id === creditCardId), [accounts, creditCardId]);

  const resetForm = () => {
    setCreditCardId('');
    setSourceAccountId('');
    setAmount('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditCardId || !sourceAccountId || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    if (parseFloat(amount) <= 0) {
       toast({
        title: "Error",
        description: "Payment amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await payBill({
          creditCardId,
          sourceAccountId,
          amount: parseFloat(amount),
      });

      toast({
        title: "Payment Successful",
        description: `Your bill payment has been recorded.`,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Error",
        description: `Failed to record payment: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-9 gap-1">
          <Receipt className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Pay Bill
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Pay Credit Card Bill</DialogTitle>
            <DialogDescription>
              Record a payment to your credit card from another account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="creditCard" className="text-right">
                Credit Card
              </Label>
              <Select onValueChange={setCreditCardId} value={creditCardId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select card to pay" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditCards.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
             {selectedCreditCard && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <div/>
                    <p className="col-span-3 text-sm text-muted-foreground -mt-2">
                        Outstanding: {formatCurrency(selectedCreditCard.balance)}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sourceAccount" className="text-right">
                Pay From
              </Label>
              <Select onValueChange={setSourceAccountId} value={sourceAccountId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 500.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Processing...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
