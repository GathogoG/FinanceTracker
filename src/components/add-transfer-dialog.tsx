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
import { Loader2, ArrowLeftRight } from 'lucide-react';
import { useFinancials } from '@/context/financial-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function AddTransferDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addTransfer, accounts } = useFinancials();

  const transferAccounts = useMemo(() => accounts.filter(acc => acc.type !== 'Credit Card'), [accounts]);

  const availableToAccounts = useMemo(() => {
    if (!fromAccountId) return transferAccounts;
    return transferAccounts.filter(acc => acc.id !== fromAccountId);
  }, [fromAccountId, transferAccounts]);

  const handleFromAccountChange = (value: string) => {
    setFromAccountId(value);
    if (toAccountId === value) {
      setToAccountId('');
    }
  };

  const resetForm = () => {
    setFromAccountId('');
    setToAccountId('');
    setAmount('');
    setDescription('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    if (fromAccountId === toAccountId) {
       toast({
        title: "Error",
        description: "Cannot transfer to and from the same account.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addTransfer({
          fromAccountId,
          toAccountId,
          amount: parseFloat(amount),
          description: description || 'Fund Transfer',
      });

      toast({
        title: "Transfer Successful",
        description: `Transfer has been recorded.`,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to record transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1 bg-indigo-500 text-primary-foreground hover:bg-indigo-600">
          <ArrowLeftRight className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Transfer
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Transfer</DialogTitle>
            <DialogDescription>
              Record a transfer of funds between your accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fromAccount" className="text-right">
                From
              </Label>
              <Select onValueChange={handleFromAccountChange} value={fromAccountId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="toAccount" className="text-right">
                To
              </Label>
              <Select onValueChange={setToAccountId} value={toAccountId}>
                  <SelectTrigger className="col-span-3" disabled={!fromAccountId}>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAccounts.map(acc => (
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
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional, e.g., Monthly savings"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Transferring...' : 'Add Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
