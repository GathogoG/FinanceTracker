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

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [billingCycleDay, setBillingCycleDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addAccount } = useFinancials();

  const resetForm = () => {
    setName('');
    setType('');
    setBalance('');
    setCreditLimit('');
    setBillingCycleDay('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !balance) {
      toast({
        title: "Error",
        description: "Please fill in Name, Type, and Balance.",
        variant: "destructive",
      });
      return;
    }
     if (type === 'Credit Card' && (!creditLimit || !billingCycleDay)) {
      toast({
        title: "Error",
        description: "Please fill in all fields for a credit card.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addAccount({
          name,
          type,
          balance: parseFloat(balance),
          creditLimit: type === 'Credit Card' ? parseFloat(creditLimit) : undefined,
          billingCycleDay: type === 'Credit Card' ? parseInt(billingCycleDay) : undefined,
      });

      toast({
        title: "Account Added",
        description: `Your ${type} account "${name}" has been added.`,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Account
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
            <DialogDescription>
              Enter your account details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Primary Checking"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select onValueChange={setType} value={type}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Account">Bank Account</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                {type === 'Credit Card' ? 'Outstanding' : 'Balance'}
              </Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 1250.75"
              />
            </div>
            {type === 'Credit Card' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="creditLimit" className="text-right">
                    Limit
                  </Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., 5000"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="billingCycleDay" className="text-right text-xs">
                    Bill Day
                  </Label>
                  <Input
                    id="billingCycleDay"
                    type="number"
                    min="1"
                    max="31"
                    value={billingCycleDay}
                    onChange={(e) => setBillingCycleDay(e.target.value)}
                    className="col-span-3"
                    placeholder="Day of month (1-31)"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Adding...' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
