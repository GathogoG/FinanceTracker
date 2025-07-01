"use client";
import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFinancials } from "@/context/financial-context";
import type { Transaction } from "@/context/financial-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  description?: string;
}

export function TransactionList({ 
  transactions, 
  title = "Transaction History", 
  description = "A log of all your transactions." 
}: TransactionListProps) {
  const { formatCurrency, accounts } = useFinancials();
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const { availableYears, availableMonths } = useMemo(() => {
    const years = new Set<string>();
    transactions.forEach(t => {
      try {
        const date = new Date(t.date);
        if (!isNaN(date.getTime())) {
            years.add(String(date.getFullYear()));
        }
      } catch (e) {
        console.error("Error parsing date:", t.date, e);
      }
    });
    return { 
      availableYears: ['all', ...Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))],
      availableMonths: ['all', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
    };
  }, [transactions]);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'N/A';
    return accounts.find(a => a.id === accountId)?.name || 'Unknown';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const typeMatch = typeFilter === 'all' 
        || (typeFilter === 'income' && t.amount > 0)
        || (typeFilter === 'expenses' && t.amount < 0);
      
      if (!typeMatch) return false;

      const date = new Date(t.date);
      if (isNaN(date.getTime())) return true; // if date is invalid, don't filter by date

      const yearMatch = yearFilter === 'all' || date.getFullYear() === parseInt(yearFilter);
      const monthMatch = monthFilter === 'all' || date.getMonth() === parseInt(monthFilter);
      
      return yearMatch && monthMatch;
    });
  }, [transactions, typeFilter, monthFilter, yearFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={String(month)}>
                    {month === 'all' ? 'All Months' : monthNames[parseInt(month)]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((t) => {
                const accountName = getAccountName(t.accountId);
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">{t.icon}</div>
                        <div>
                          <div className="font-medium">{t.description}</div>
                          <div className="text-sm text-muted-foreground sm:hidden">{new Date(t.date).toLocaleDateString()}</div>
                          {t.category !== 'Transfer' && <div className="text-xs text-muted-foreground">{accountName}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline">{t.category}</Badge></TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      {
                        "text-yellow-500": t.category === 'Borrowed',
                        "text-green-500": t.amount > 0 && t.category !== 'Borrowed',
                        "text-destructive": t.amount < 0
                      }
                    )}>
                      {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No transactions found for this filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
