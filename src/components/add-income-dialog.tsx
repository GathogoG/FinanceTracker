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
import { Loader2, PlusCircle } from 'lucide-react';
import { useFinancials } from '@/context/financial-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

export function AddIncomeDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [lender, setLender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addIncome, accounts } = useFinancials();

  const incomeAccounts = accounts.filter(acc => acc.type === 'Bank Account' || acc.type === 'Cash');

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setAccountId('');
    setIsBorrowing(false);
    setLender('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !accountId) {
      toast({
        title: "Error",
        description: "Please fill in description, amount, and select an account.",
        variant: "destructive",
      });
      return;
    }
    if (isBorrowing && !lender) {
      toast({
        title: "Error",
        description: "Please enter the lender's name.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addIncome({
          description,
          amount: parseFloat(amount),
          accountId,
          isBorrowing,
          lender: isBorrowing ? lender : undefined,
      });

      toast({
        title: "Income Added",
        description: `Your income has been successfully recorded.`,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1 bg-green-600 text-primary-foreground hover:bg-green-700">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Income
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>
              Record any incoming funds to your accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                Account
              </Label>
              <Select onValueChange={setAccountId} value={accountId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Monthly Salary, Pocket Money"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 2000.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is-borrowing" className="text-right">Borrow?</Label>
                <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox id="is-borrowing" checked={isBorrowing} onCheckedChange={(checked) => setIsBorrowing(checked as boolean)} />
                    <label htmlFor="is-borrowing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">This is borrowed money</label>
                </div>
            </div>
            {isBorrowing && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lender" className="text-right">Lender</Label>
                    <Input id="lender" value={lender} onChange={e => setLender(e.target.value)} className="col-span-3" placeholder="e.g. John Doe" />
                </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Adding...' : 'Add Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
