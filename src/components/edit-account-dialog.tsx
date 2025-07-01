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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFinancials, Account } from '@/context/financial-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditAccountDialogProps {
    account: Account;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function EditAccountDialog({ account, isOpen, onOpenChange }: EditAccountDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);
  const [balance, setBalance] = useState(String(Math.abs(account.balance)));
  const [creditLimit, setCreditLimit] = useState(String(account.creditLimit || ''));
  const [billingCycleDay, setBillingCycleDay] = useState(String(account.billingCycleDay || ''));
  const [isLoading, setIsLoading] = useState(false);
  const { updateAccount } = useFinancials();

  useEffect(() => {
    setName(account.name);
    setType(account.type);
    setBalance(String(Math.abs(account.balance)));
    setCreditLimit(String(account.creditLimit || ''));
    setBillingCycleDay(String(account.billingCycleDay || ''));
  }, [account]);

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
      await updateAccount(account.id, {
          name,
          type,
          balance: parseFloat(balance),
          creditLimit: type === 'Credit Card' ? parseFloat(creditLimit) : undefined,
          billingCycleDay: type === 'Credit Card' ? parseInt(billingCycleDay) : undefined,
      });

      toast({
        title: "Account Updated",
        description: `Your ${type} account "${name}" has been updated.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update your account details below.
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
