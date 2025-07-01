"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFinancials, Account } from "@/context/financial-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { EditAccountDialog } from './edit-account-dialog';
import { useRouter } from 'next/navigation';


interface AccountListCardProps {
  title: string;
  accounts: Account[];
}

export function AccountListCard({ title, accounts }: AccountListCardProps) {
  const { formatCurrency, deleteAccount } = useFinancials();
  const { toast } = useToast();
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const router = useRouter();

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      toast({
        title: "Success",
        description: "Account deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    }
  };
  
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-4 p-4 -mx-4 rounded-lg active:bg-muted/50 cursor-pointer"
              onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
            >
              <div className="p-3 bg-muted rounded-full">{account.icon}</div>
              <div className="flex-1">
                <p className="font-semibold">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.type}</p>
                 {account.type === 'Credit Card' && account.creditLimit && (
                  <div className="text-xs text-muted-foreground">
                    Available: {formatCurrency(account.creditLimit + account.balance)} of {formatCurrency(account.creditLimit)}
                  </div>
                )}
              </div>
              <div className={`font-semibold ${account.type === 'Credit Card' ? 'text-destructive' : ''}`}>
                {formatCurrency(account.balance)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleActionClick}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={handleActionClick}>
                  <DropdownMenuItem onSelect={() => setAccountToEdit(account)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            <span className="text-destructive">Delete</span>
                         </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(account.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </CardContent>
      </Card>
      {accountToEdit && (
         <EditAccountDialog 
            account={accountToEdit} 
            isOpen={!!accountToEdit}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setAccountToEdit(null);
                }
            }}
        />
      )}
    </>
  );
}
