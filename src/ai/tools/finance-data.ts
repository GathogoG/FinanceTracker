'use server';

import { collection, getDocs, orderBy, query, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Account, InvestmentHolding, Transaction } from '@/types/financial';
import { getStockQuotes } from '../flows/investment-flows';
import { ai } from '@/ai/genkit';
import { z } from 'zod';


export async function calculateNetWorth(userId: string): Promise<{ netWorth: number }> {
    if (!userId || !db) throw new Error('User not authenticated or DB not available');
    
    const accountsRef = collection(db, `users/${userId}/accounts`);
    const accountsSnapshot = await getDocs(accountsRef);
    const accountBalance = accountsSnapshot.docs.reduce((sum, doc) => sum + doc.data().balance, 0);

    // Investment value is temporarily not included in net worth calculation.
    const investmentValue = 0;
    
    return { netWorth: accountBalance + investmentValue };
}

export async function getAccounts(userId: string): Promise<Omit<Account, 'id' | 'icon'>[]> {
    if (!userId || !db) throw new Error('User not authenticated or DB not available');
    const accountsRef = collection(db, `users/${userId}/accounts`);
    const accountsSnapshot = await getDocs(accountsRef);

    if (accountsSnapshot.empty) {
        return [];
    }

    return accountsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name,
            type: data.type,
            balance: data.balance,
        };
    });
}

export async function getRecentTransactions(userId: string): Promise<Omit<Transaction, 'id' | 'icon' | 'accountId'>[]> {
    if (!userId || !db) throw new Error('User not authenticated or DB not available');
    const transQuery = query(collection(db, `users/${userId}/transactions`), orderBy('date', 'desc'), limit(5));
    const querySnapshot = await getDocs(transQuery);

    if (querySnapshot.empty) {
        return [];
    }

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            date: data.date.toDate().toLocaleDateString(),
            description: data.description,
            amount: data.amount,
            category: data.category,
        }
    });
}

// Define tools at the top level
export const getNetWorthTool = ai.defineTool(
  {
    name: 'getNetWorth',
    description: "Get the user's current total net worth.",
    inputSchema: z.object({ userId: z.string().describe("The user's unique ID.") }),
    outputSchema: z.object({netWorth: z.number()}),
  },
  async ({ userId }) => calculateNetWorth(userId)
);

export const getAccountBalancesTool = ai.defineTool(
  {
    name: 'getAccountBalances',
    description: "Get a list of all of the user's accounts and their balances.",
    inputSchema: z.object({ userId: z.string().describe("The user's unique ID.") }),
    outputSchema: z.array(
      z.object({name: z.string(), type: z.string(), balance: z.number()})
    ),
  },
  async ({ userId }) => getAccounts(userId)
);

export const getRecentTransactionsTool = ai.defineTool(
  {
      name: 'getRecentTransactions',
      description: "Get a list of the user's 5 most recent transactions.",
      inputSchema: z.object({ userId: z.string().describe("The user's unique ID.") }),
      outputSchema: z.array(z.object({
          date: z.string(),
          description: z.string(),
          amount: z.number(),
          category: z.string()
      }))
  },
  async ({ userId }) => getRecentTransactions(userId)
);
