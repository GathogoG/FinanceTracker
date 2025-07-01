import type { User } from 'firebase/auth';

export interface AppUser extends User {
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  icon: React.ReactNode;
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  creditLimit?: number;
  billingCycleDay?: number;
  icon: React.ReactNode;
}

export interface InvestmentHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchaseValue: number;
  purchaseDate: string;
}

export interface Investment extends InvestmentHolding {
    currentPrice: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercent: string;
    dayChange: number;
    dayChangePercent: string;
    changeType: 'up' | 'down' | 'flat';
}

export interface Settlement {
  id: string;
  amount: number;
  date: string;
}

export interface Borrow {
  id: string;
  lender: string;
  originalAmount: number;
  remainingAmount: number;
  date: string;
  status: 'outstanding' | 'settled';
  settlements: Settlement[];
  settledDate?: string;
}

export interface Lent {
  id: string;
  borrower: string; // The person who owes money
  description: string;
  originalAmount: number;
  remainingAmount: number;
  date: string;
  status: 'outstanding' | 'settled';
  settlements: Settlement[];
  settledDate?: string;
}
