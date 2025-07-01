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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';
import { categorizeExpense, CategorizeExpenseInput } from '@/ai/flows/categorize-expense';
import { Loader2, MinusCircle, PlusCircle, X } from 'lucide-react';
import { useFinancials, Account } from '@/context/financial-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addTransaction, addSplitExpense, accounts, formatCurrency } = useFinancials();
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const [isSplit, setIsSplit] = useState(false);
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [friendName, setFriendName] = useState('');

  useEffect(() => {
    if (accountId) {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        setSelectedAccount(account);
        const balance = account.type === 'Credit Card' 
          ? (account.creditLimit || 0) + account.balance 
          : account.balance;
        setAvailableBalance(balance);
      }
    } else {
      setSelectedAccount(null);
      setAvailableBalance(null);
    }
    setAmountError(null);
  }, [accountId, accounts]);

  useEffect(() => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && availableBalance !== null) {
      if (numericAmount > availableBalance) {
        setAmountError("Insufficient balance.");
      } else {
        setAmountError(null);
      }
    } else {
      setAmountError(null);
    }
  }, [amount, availableBalance]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setAccountId('');
    setSelectedAccount(null);
    setAvailableBalance(null);
    setAmountError(null);
    setIsSplit(false);
    setSplitWith([]);
    setFriendName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !accountId) {
      toast({
        title: "Error",
        description: "Please fill in all fields, including selecting an account.",
        variant: "destructive",
      });
      return;
    }

    if (amountError) {
      toast({ title: "Error", description: amountError, variant: "destructive" });
      return;
    }

    if (isSplit && splitWith.length === 0) {
      toast({ title: "Error", description: "Please add at least one friend to split with.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const numericAmount = parseFloat(amount);
      const input: CategorizeExpenseInput = {
        description,
        amount: numericAmount,
      };
      const result = await categorizeExpense(input);
      
      if (isSplit && splitWith.length > 0) {
        await addSplitExpense({
          description,
          amount: numericAmount,
          accountId,
          category: result.category,
          splitWith,
        });
        toast({ title: "Split Expense Added", description: `Expense categorized as '${result.category}'.` });
      } else {
        await addTransaction({
            description,
            amount: -numericAmount,
            category: result.category,
            accountId,
        });
        toast({ title: "Expense Added", description: `Expense categorized as '${result.category}' with ${Math.round(result.confidence * 100)}% confidence.` });
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to categorize expense. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
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
        <Button size="sm" variant="destructive" className="h-9 gap-1">
          <MinusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Expense
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Enter expense details. Our AI will automatically categorize it for you.
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
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            {selectedAccount && availableBalance !== null && (
                <div className="grid grid-cols-4 items-center gap-4 -mt-2">
                    <div/>
                    <p className="col-span-3 text-sm text-muted-foreground">
                        Available: {formatCurrency(availableBalance)}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Coffee shop"
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
                className={cn("col-span-3", amountError && "border-destructive focus-visible:ring-destructive")}
                placeholder="e.g., 5.50"
              />
            </div>
             {amountError && (
                <div className="grid grid-cols-4 items-center gap-4 -mt-2">
                    <div />
                    <p className="col-span-3 text-sm text-destructive">{amountError}</p>
                </div>
            )}
             <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 flex items-center space-x-2">
                    <Checkbox id="is-split" checked={isSplit} onCheckedChange={(checked) => setIsSplit(checked as boolean)} />
                    <Label htmlFor="is-split" className="font-normal">Split this expense</Label>
                </div>
            </div>

            {isSplit && (
                <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="friend-name" className="text-right">With</Label>
                        <div className="col-span-3 flex gap-2">
                            <Input id="friend-name" value={friendName} onChange={e => setFriendName(e.target.value)} placeholder="Friend's name"/>
                            <Button type="button" variant="outline" size="icon" onClick={() => {
                                if (friendName.trim()) {
                                    setSplitWith([...splitWith, friendName.trim()]);
                                    setFriendName('');
                                }
                            }}>
                                <PlusCircle className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                    {splitWith.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div/>
                            <div className="col-span-3 flex flex-wrap gap-2">
                                {splitWith.map((name, index) => (
                                    <Badge key={index} variant="secondary">
                                        {name}
                                        <button type="button" onClick={() => setSplitWith(splitWith.filter((_, i) => i !== index))} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    {splitWith.length > 0 && parseFloat(amount || '0') > 0 && (
                      <div className="grid grid-cols-4 items-center gap-4 text-sm text-muted-foreground">
                        <div />
                        <p className="col-span-3">
                          Each of the {splitWith.length + 1} people will owe {formatCurrency(parseFloat(amount) / (splitWith.length + 1))}.
                        </p>
                      </div>
                    )}
                </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !!amountError}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Processing...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
