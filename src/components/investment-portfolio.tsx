"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical, Trash2 } from 'lucide-react';
import { useFinancials } from "@/context/financial-context";
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function InvestmentPortfolio() {
  const { investments, formatCurrency, loading, deleteInvestment } = useFinancials();
  const { toast } = useToast();

  const handleDelete = async (investmentId: string) => {
    try {
      await deleteInvestment(investmentId);
      toast({
        title: "Success",
        description: "Investment deleted successfully.",
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to delete investment.",
        variant: "destructive",
      });
    }
  };

  const renderGainLoss = (value: number, percentage: string) => {
    const isPositive = value >= 0;
    return (
      <div className={cn("font-semibold", isPositive ? 'text-green-500' : 'text-destructive')}>
        <div>{formatCurrency(value)}</div>
        <div className="text-xs">({percentage}%)</div>
      </div>
    );
  };

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-24" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/5" />
                            </div>
                            <Skeleton className="h-6 w-1/5" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
       <CardHeader>
        <CardTitle>Your Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        {investments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Security</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Day's Gain</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Total Return</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-bold">{inv.symbol}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[120px]">{inv.name}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                       {renderGainLoss(inv.gainLoss, inv.gainLossPercent)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">{formatCurrency(inv.currentValue)}</div>
                    <div className="text-sm text-muted-foreground">{inv.quantity} shares</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {renderGainLoss(inv.dayChange * inv.quantity, inv.dayChangePercent)}
                  </TableCell>
                   <TableCell className="hidden sm:table-cell text-right">
                    {renderGainLoss(inv.gainLoss, inv.gainLossPercent)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                                  This will permanently delete this investment holding. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(inv.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-12 text-center">
              <h3 className="text-xl font-semibold tracking-tight">No investments yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Add Investment" to get started.
              </p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
