"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, query, orderBy, Timestamp, doc, updateDoc, deleteDoc, runTransaction, getDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ShoppingBag, Film, Utensils, Shirt, Car, HandCoins, Landmark, CreditCard, PiggyBank, Briefcase, Handshake, Wallet, ArrowLeftRight, Receipt, Activity, Users } from 'lucide-react';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';
import type { AppUser, Transaction, Account, InvestmentHolding, Investment, Borrow, Settlement, Lent } from '@/types/financial';

interface PayBillData {
  creditCardId: string;
  sourceAccountId: string;
  amount: number;
}

// Helper
const categoryToIcon: { [key: string]: React.ReactNode } = {
  'Groceries': <ShoppingBag className="h-5 w-5" />,
  'Entertainment': <Film className="h-5 w-5" />,
  'Food': <Utensils className="h-5 w-5" />,
  'Shopping': <Shirt className="h-5 w-5" />,
  'Transport': <Car className="h-5 w-5" />,
  'Income': <HandCoins className="h-5 w-5" />,
  'Borrowed': <Handshake className="h-5 w-5" />,
  'Settlement': <Handshake className="h-5 w-5" />,
  'Lent': <HandCoins className="h-5 w-5" />,
  'Reimbursement': <Users className="h-5 w-5" />,
  'Transfer': <ArrowLeftRight className="h-5 w-5" />,
  'Fees': <Receipt className="h-5 w-5" />,
  'Default': <ShoppingBag className="h-5 w-5" />,
};

const accountTypeToIcon: { [key: string]: React.ReactNode } = {
  'Bank Account': <Landmark className="h-5 w-5" />,
  'Credit Card': <CreditCard className="h-5 w-5" />,
  'Cash': <Wallet className="h-5 w-5" />,
  'Default': <Landmark className="h-5 w-5" />,
};

// Context
interface FinancialContextType {
  user: AppUser | null;
  loading: boolean;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'icon' | 'date'>) => Promise<void>;
  addSplitExpense: (data: { description: string, amount: number, accountId: string, category: string, splitWith: string[] }) => Promise<void>;
  addIncome: (data: { description: string, amount: number, accountId: string, isBorrowing?: boolean, lender?: string }) => Promise<void>;
  addTransfer: (data: { fromAccountId: string, toAccountId: string, amount: number, description?: string }) => Promise<void>;
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'icon'>) => Promise<void>;
  updateAccount: (accountId: string, data: Partial<Omit<Account, 'id' | 'icon'>>) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  investments: Investment[];
  addInvestment: (investment: Omit<InvestmentHolding, 'id'>) => Promise<void>;
  deleteInvestment: (investmentId: string) => Promise<void>;
  borrows: Borrow[];
  settleBorrow: (borrowId: string, fromAccountId: string, paymentAmount?: number) => Promise<void>;
  lent: Lent[];
  settleLent: (lentId: string, toAccountId: string, paymentAmount?: number) => Promise<void>;
  addLentMoney: (data: { borrower: string; amount: number; fromAccountId: string; }) => Promise<void>;
  payBill: (data: PayBillData) => Promise<void>;
  submitFeedback: (message: string) => Promise<void>;
  currency: string;
  setCurrency: (currency: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  formatCurrency: (amount: number) => string;
  logout: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [lent, setLent] = useState<Lent[]>([]);
  const [currency, setCurrencyState] = useState('INR');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const router = useRouter();
  
  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        const isAdmin = userDoc.exists() ? userDoc.data().isAdmin || false : false;

        setUser({ ...authUser, isAdmin });

      } else {
        setUser(null);
        setTransactions([]);
        setAccounts([]);
        setInvestments([]);
        setBorrows([]);
        setLent([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && db) {
      let isMounted = true;
      setLoading(true);

      const transQuery = query(collection(db, `users/${user.uid}/transactions`), orderBy('date', 'desc'));
      const unsubTransactions = onSnapshot(transQuery, (snapshot) => {
        if (!isMounted) return;
        const userTransactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate().toISOString(),
            icon: categoryToIcon[data.category] || categoryToIcon['Default'],
          } as Transaction;
        });
        setTransactions(userTransactions);
      });

      const accQuery = query(collection(db, `users/${user.uid}/accounts`));
      const unsubAccounts = onSnapshot(accQuery, (snapshot) => {
        if (!isMounted) return;
         const userAccounts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          icon: accountTypeToIcon[doc.data().type] || accountTypeToIcon['Default'],
        })) as Account[];
        setAccounts(userAccounts);
      });
      
      const borrowsQuery = query(collection(db, `users/${user.uid}/borrows`), orderBy('date', 'desc'));
      const unsubBorrows = onSnapshot(borrowsQuery, async (borrowsSnapshot) => {
          if (!isMounted) return;

          const userBorrowsPromises = borrowsSnapshot.docs.map(async (borrowDoc) => {
              const borrowData = borrowDoc.data();
              
              const settlementsQuery = query(collection(db, `users/${user.uid}/borrows/${borrowDoc.id}/settlements`), orderBy('date', 'desc'));
              const settlementsSnapshot = await getDocs(settlementsQuery);
              const settlements = settlementsSnapshot.docs.map(settlementDoc => {
                  const settlementData = settlementDoc.data();
                  return {
                      id: settlementDoc.id,
                      amount: settlementData.amount,
                      date: (settlementData.date as Timestamp).toDate().toISOString(),
                  } as Settlement;
              });

              return {
                  id: borrowDoc.id,
                  ...borrowData,
                  date: (borrowData.date as Timestamp).toDate().toISOString(),
                  settledDate: borrowData.settledDate ? (borrowData.settledDate as Timestamp).toDate().toISOString() : undefined,
                  settlements,
              } as Borrow;
          });

          const userBorrows = await Promise.all(userBorrowsPromises);
          if (isMounted) {
            setBorrows(userBorrows);
          }
      });
      
      const lentQuery = query(collection(db, `users/${user.uid}/lent`), orderBy('date', 'desc'));
      const unsubLent = onSnapshot(lentQuery, async (lentSnapshot) => {
          if (!isMounted) return;
          const userLentPromises = lentSnapshot.docs.map(async (lentDoc) => {
              const lentData = lentDoc.data();
              const settlementsQuery = query(collection(db, `users/${user.uid}/lent/${lentDoc.id}/settlements`), orderBy('date', 'desc'));
              const settlementsSnapshot = await getDocs(settlementsQuery);
              const settlements = settlementsSnapshot.docs.map(settlementDoc => {
                  const settlementData = settlementDoc.data();
                  return {
                      id: settlementDoc.id,
                      amount: settlementData.amount,
                      date: (settlementData.date as Timestamp).toDate().toISOString(),
                  } as Settlement;
              });

              return {
                  id: lentDoc.id,
                  ...lentData,
                  date: (lentData.date as Timestamp).toDate().toISOString(),
                  settledDate: lentData.settledDate ? (lentData.settledDate as Timestamp).toDate().toISOString() : undefined,
                  settlements,
              } as Lent;
          });
          const userLent = await Promise.all(userLentPromises);
          if (isMounted) {
              setLent(userLent);
          }
      });

      const investmentsQuery = query(collection(db, `users/${user.uid}/investments`), orderBy('purchaseDate', 'desc'));
      const unsubInvestments = onSnapshot(investmentsQuery, (snapshot) => {
          if (!isMounted) return;
          const userHoldings = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                  id: doc.id,
                  ...data,
                  purchaseDate: (data.purchaseDate as Timestamp).toDate().toISOString(),
              } as InvestmentHolding;
          });
          // enrichInvestmentData(userHoldings); // Temporarily disabled
          setInvestments([]);
      });

      const userDocRef = doc(db, `users/${user.uid}`);
      const unsubUser = onSnapshot(userDocRef, (doc) => {
        if (!isMounted) return;
        if (doc.exists()) {
          const data = doc.data();
          const prefs = data.preferences || {};
          const isAdmin = data.isAdmin || false;
          setUser(prev => prev ? {...prev, isAdmin} : null);
          if (prefs.currency) setCurrencyState(prefs.currency);
          if (prefs.theme) setThemeState(prefs.theme);
        }
      });
      
      Promise.all([
          new Promise(res => onSnapshot(transQuery, res)),
          new Promise(res => onSnapshot(accQuery, res)),
      ]).finally(() => {
          if (isMounted) setLoading(false);
      });


      return () => {
        isMounted = false;
        unsubTransactions();
        unsubAccounts();
        unsubBorrows();
        unsubInvestments();
        unsubUser();
        unsubLent();
      };
    }
  }, [user?.uid]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'icon' | 'date'>) => {
    if (!user || !db) throw new Error("Firebase not configured");

    const { accountId, amount, category, description } = transaction;
    if (!accountId) {
      throw new Error("Account ID is required to add a transaction.");
    }
    
    const accountRef = doc(db, `users/${user.uid}/accounts`, accountId);
    const transactionsColRef = collection(db, `users/${user.uid}/transactions`);

    await runTransaction(db, async (tx) => {
        const accountDoc = await tx.get(accountRef);
        if (!accountDoc.exists()) {
            throw new Error("Account not found!");
        }

        const accountData = accountDoc.data();
        const newBalance = accountData.balance + amount;
        tx.update(accountRef, { balance: newBalance });

        tx.set(doc(transactionsColRef), {
            description,
            amount,
            category,
            date: new Date(),
            accountId,
        });
    });
  };

  const addSplitExpense = async (data: { description: string, amount: number, accountId: string, category: string, splitWith: string[] }) => {
    if (!user || !db) throw new Error("Firebase not configured");
    const { description, amount, accountId, category, splitWith } = data;

    await runTransaction(db, async (tx) => {
        const accountRef = doc(db, `users/${user.uid}/accounts`, accountId);
        const accountDoc = await tx.get(accountRef);
        if (!accountDoc.exists()) throw new Error("Account not found");

        // The user pays the full amount from their account
        const newBalance = accountDoc.data().balance - amount;
        tx.update(accountRef, { balance: newBalance });

        // Create the expense transaction for the full amount
        const transactionsColRef = collection(db, `users/${user.uid}/transactions`);
        tx.set(doc(transactionsColRef), {
            description: `${description} (Split)`,
            amount: -amount,
            category: category,
            date: new Date(),
            accountId,
        });

        // Create lent records for each friend
        const totalPeople = splitWith.length + 1;
        const splitAmount = amount / totalPeople;
        const lentColRef = collection(db, `users/${user.uid}/lent`);
        for (const friendName of splitWith) {
            const lentDocRef = doc(lentColRef);
            tx.set(lentDocRef, {
                borrower: friendName,
                description: description,
                originalAmount: splitAmount,
                remainingAmount: splitAmount,
                date: serverTimestamp(),
                status: 'outstanding',
            });
        }
    });
  };

  const addIncome = async (data: { description: string, amount: number, accountId: string, isBorrowing?: boolean, lender?: string }) => {
    if (!user || !db) throw new Error("Firebase not configured");
    const { description, amount, accountId, isBorrowing, lender } = data;

    await runTransaction(db, async (tx) => {
        const accountRef = doc(db, `users/${user.uid}/accounts`, accountId);
        const accountDoc = await tx.get(accountRef);
        if (!accountDoc.exists()) throw new Error("Account not found");

        const newBalance = accountDoc.data().balance + amount;
        tx.update(accountRef, { balance: newBalance });

        const transactionsColRef = collection(db, `users/${user.uid}/transactions`);
        tx.set(doc(transactionsColRef), {
            description,
            amount,
            category: isBorrowing ? 'Borrowed' : 'Income',
            date: new Date(),
            accountId,
        });

        if (isBorrowing && lender) {
            const borrowsColRef = collection(db, `users/${user.uid}/borrows`);
            tx.set(doc(borrowsColRef), {
                lender,
                originalAmount: amount,
                remainingAmount: amount,
                date: new Date(),
                status: 'outstanding',
            });
        }
    });
  };

  const addLentMoney = async (data: { borrower: string, amount: number, fromAccountId: string }) => {
    if (!user || !db) throw new Error("Firebase not configured");
    const { borrower, amount, fromAccountId } = data;

    await runTransaction(db, async (tx) => {
        const accountRef = doc(db, `users/${user.uid}/accounts`, fromAccountId);
        const accountDoc = await tx.get(accountRef);
        if (!accountDoc.exists()) throw new Error("Source account not found");

        if (accountDoc.data().balance < amount) {
            throw new Error("Insufficient balance.");
        }

        const newBalance = accountDoc.data().balance - amount;
        tx.update(accountRef, { balance: newBalance });

        const transactionsColRef = collection(db, `users/${user.uid}/transactions`);
        tx.set(doc(transactionsColRef), {
            description: `Loan to ${borrower}`,
            amount: -amount,
            category: 'Lent',
            date: new Date(),
            accountId: fromAccountId,
        });

        const lentColRef = collection(db, `users/${user.uid}/lent`);
        const lentDocRef = doc(lentColRef);
        tx.set(lentDocRef, {
            borrower: borrower,
            description: `Direct loan`,
            originalAmount: amount,
            remainingAmount: amount,
            date: serverTimestamp(),
            status: 'outstanding',
        });
    });
  };

  const settleBorrow = async (borrowId: string, fromAccountId: string, paymentAmount?: number) => {
    if (!user || !db) throw new Error("Firebase not configured");

    await runTransaction(db, async (tx) => {
        const borrowRef = doc(db, `users/${user.uid}/borrows`, borrowId);
        const accountRef = doc(db, `users/${user.uid}/accounts`, fromAccountId);
        
        const borrowDoc = await tx.get(borrowRef);
        const accountDoc = await tx.get(accountRef);

        if (!borrowDoc.exists() || !accountDoc.exists()) {
            throw new Error("Borrow record or account not found.");
        }

        const borrowData = borrowDoc.data() as Omit<Borrow, 'id' | 'settlements'>;
        const accountData = accountDoc.data();
        
        const amountToPay = paymentAmount !== undefined ? paymentAmount : borrowData.remainingAmount;
        if (amountToPay > accountData.balance) {
            throw new Error("Insufficient balance in source account.");
        }
        if (amountToPay > borrowData.remainingAmount + 0.001) { // Add tolerance for floating point issues
            throw new Error("Payment amount exceeds remaining debt.");
        }
        
        const newAccountBalance = accountData.balance - amountToPay;
        tx.update(accountRef, { balance: newAccountBalance });

        const transactionsColRef = collection(db, `users/${user.uid}/transactions`);
        tx.set(doc(transactionsColRef), {
            description: `Debt payment to ${borrowData.lender}`,
            amount: -amountToPay,
            category: 'Settlement',
            date: new Date(),
            accountId: fromAccountId,
        });
        
        const settlementRef = doc(collection(db, `users/${user.uid}/borrows/${borrowId}/settlements`));
        tx.set(settlementRef, {
            amount: amountToPay,
            date: serverTimestamp()
        });
        
        const newRemainingAmount = borrowData.remainingAmount - amountToPay;
        if (newRemainingAmount <= 0) {
            tx.update(borrowRef, { 
                remainingAmount: 0,
                status: 'settled', 
                settledDate: serverTimestamp() 
            });
        } else {
            tx.update(borrowRef, { remainingAmount: newRemainingAmount });
        }
    });
  };

  const settleLent = async (lentId: string, toAccountId: string, paymentAmount?: number) => {
    if (!user || !db) throw new Error("Firebase not configured");
    await runTransaction(db, async (tx) => {
        const lentRef = doc(db, `users/${user.uid}/lent`, lentId);
        const accountRef = doc(db, `users/${user.uid}/accounts`, toAccountId);
        
        const lentDoc = await tx.get(lentRef);
        const accountDoc = await tx.get(accountRef);
        if (!lentDoc.exists() || !accountDoc.exists()) throw new Error("Lent record or account not found.");

        const lentData = lentDoc.data() as Omit<Lent, 'id' | 'settlements'>;
        const accountData = accountDoc.data();
        
        const amountToSettle = paymentAmount !== undefined ? paymentAmount : lentData.remainingAmount;
        if (amountToSettle > lentData.remainingAmount + 0.001) throw new Error("Settlement amount exceeds remaining balance.");

        const newAccountBalance = accountData.balance + amountToSettle;
        tx.update(accountRef, { balance: newAccountBalance });

        const transactionsColRef = collection(db, `users/${user.uid}/transactions`);
        tx.set(doc(transactionsColRef), {
            description: `Payment from ${lentData.borrower}`,
            amount: amountToSettle,
            category: 'Reimbursement',
            date: new Date(),
            accountId: toAccountId,
        });

        const settlementRef = doc(collection(db, `users/${user.uid}/lent/${lentId}/settlements`));
        tx.set(settlementRef, { amount: amountToSettle, date: serverTimestamp() });
        
        const newRemainingAmount = lentData.remainingAmount - amountToSettle;
        if (newRemainingAmount <= 0) {
            tx.update(lentRef, { remainingAmount: 0, status: 'settled', settledDate: serverTimestamp() });
        } else {
            tx.update(lentRef, { remainingAmount: newRemainingAmount });
        }
    });
  };

  const addTransfer = async (data: { fromAccountId: string, toAccountId: string, amount: number, description?: string }) => {
    if (!user || !db) throw new Error("Firebase not configured or user not logged in");
    const { fromAccountId, toAccountId, amount, description } = data;

    const fromAccountRef = doc(db, `users/${user.uid}/accounts`, fromAccountId);
    const toAccountRef = doc(db, `users/${user.uid}/accounts`, toAccountId);
    const transactionsRef = collection(db, `users/${user.uid}/transactions`);

    await runTransaction(db, async (transaction) => {
        const fromDoc = await transaction.get(fromAccountRef);
        const toDoc = await transaction.get(toAccountRef);

        if (!fromDoc.exists() || !toDoc.exists()) {
            throw new Error("One or both accounts not found!");
        }

        const fromAccount = fromDoc.data();
        const toAccount = toDoc.data();

        const newFromBalance = fromAccount.balance - amount;
        const newToBalance = toAccount.balance + amount;

        transaction.update(fromAccountRef, { balance: newFromBalance });
        transaction.update(toAccountRef, { balance: newToBalance });

        const date = new Date();
        
        transaction.set(doc(transactionsRef), {
            description: description || `Transfer to ${toAccount.name}`,
            amount: -Math.abs(amount),
            category: 'Transfer',
            date,
            accountId: fromAccountId,
        });

        transaction.set(doc(transactionsRef), {
            description: description || `Transfer from ${fromAccount.name}`,
            amount: Math.abs(amount),
            category: 'Transfer',
            date,
            accountId: toAccountId
        });
    });
  };


  const addAccount = async (account: Omit<Account, 'id' | 'icon'>) => {
    if (!user || !db) throw new Error("Firebase not configured");

    const newAccount: any = {
      name: account.name,
      type: account.type,
      balance: account.type === 'Credit Card' ? -Math.abs(account.balance) : account.balance,
    };

    if (account.type === 'Credit Card') {
      newAccount.creditLimit = account.creditLimit || 0;
      newAccount.billingCycleDay = account.billingCycleDay || 1;
    }
    
    await addDoc(collection(db, `users/${user.uid}/accounts`), newAccount);
  };

  const updateAccount = async (accountId: string, data: Partial<Omit<Account, 'id' | 'icon'>>) => {
    if (!user || !db) throw new Error("Firebase not configured");
    const accountRef = doc(db, `users/${user.uid}/accounts`, accountId);

    const updateData: any = { ...data };

    if (data.balance !== undefined) {
      updateData.balance = data.type === 'Credit Card' ? -Math.abs(data.balance) : data.balance;
    }
      
    await updateDoc(accountRef, updateData);
  };

  const deleteAccount = async (accountId: string) => {
    if (!user || !db) throw new Error("Firebase not configured");
    const accountRef = doc(db, `users/${user.uid}/accounts`, accountId);
    await deleteDoc(accountRef);
  };

  const addInvestment = async (investment: Omit<InvestmentHolding, 'id'>) => {
    if (!user || !db) throw new Error("Firebase not configured");
    // The purchaseDate is now expected to be an ISO string from the dialog
    const dataToSave = {
      ...investment,
      purchaseDate: Timestamp.fromDate(new Date(investment.purchaseDate)),
    };
    await addDoc(collection(db, `users/${user.uid}/investments`), dataToSave);
  };

  const deleteInvestment = async (investmentId: string) => {
    if (!user || !db) throw new Error("Firebase not configured");
    const investmentRef = doc(db, `users/${user.uid}/investments`, investmentId);
    await deleteDoc(investmentRef);
  };


  const payBill = async (data: PayBillData) => {
    if (!user || !db) throw new Error("Firebase not configured");
    const { creditCardId, sourceAccountId, amount } = data;
    if (amount <= 0) throw new Error("Payment amount must be positive.");

    const creditCardRef = doc(db, `users/${user.uid}/accounts`, creditCardId);
    const sourceAccountRef = doc(db, `users/${user.uid}/accounts`, sourceAccountId);
    const transactionsRef = collection(db, `users/${user.uid}/transactions`);

    await runTransaction(db, async (transaction) => {
        const ccDoc = await transaction.get(creditCardRef);
        const sourceDoc = await transaction.get(sourceAccountRef);

        if (!ccDoc.exists() || !sourceDoc.exists()) {
            throw new Error("One or both accounts not found!");
        }
        if (ccDoc.data().type !== 'Credit Card') {
            throw new Error("Payment can only be made to a credit card account.");
        }

        const ccData = ccDoc.data();
        const sourceData = sourceDoc.data();

        const outstandingBalance = Math.abs(ccData.balance);
        const discrepancy = amount - outstandingBalance;
        let finalCCBalance = ccData.balance + amount;

        if (Math.abs(discrepancy) > 0.01) { 
            transaction.set(doc(transactionsRef), {
                description: 'Card Payment Misc.',
                amount: -discrepancy,
                category: 'Fees',
                date: new Date(),
                accountId: creditCardId,
            });
            finalCCBalance -= discrepancy;
        }

        transaction.set(doc(transactionsRef), {
            description: `Payment to ${ccData.name}`,
            amount: -amount,
            category: 'Transfer',
            date: new Date(),
            accountId: sourceAccountId,
        });

        transaction.set(doc(transactionsRef), {
            description: `Payment from ${sourceData.name}`,
            amount: amount,
            category: 'Transfer',
            date: new Date(),
            accountId: creditCardId,
        });
        
        const finalSourceBalance = sourceData.balance - amount;
        transaction.update(sourceAccountRef, { balance: finalSourceBalance });
        transaction.update(creditCardRef, { balance: finalCCBalance });
    });
  };

  const submitFeedback = async (message: string) => {
    if (!user || !db) throw new Error("User not logged in");
    const feedbackColRef = collection(db, 'feedback');
    await addDoc(feedbackColRef, {
        message,
        userId: user.uid,
        userDisplayName: user.displayName,
        userEmail: user.email,
        userPhotoURL: user.photoURL,
        timestamp: serverTimestamp(),
    });
  };

  const setCurrency = async (newCurrency: string) => {
    if (!user || !db) return;
    setCurrencyState(newCurrency); // Optimistic update
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { 'preferences.currency': newCurrency });
  };

  const setTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    if (!user || !db) return;
    setThemeState(newTheme); // Optimistic update
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { 'preferences.theme': newTheme });
  };

  const logout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    router.push('/');
  };

  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, currency);
  
  const value = {
    user,
    loading,
    transactions,
    addTransaction,
    addSplitExpense,
    addIncome,
    addTransfer,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    investments,
    addInvestment,
    deleteInvestment,
    borrows,
    settleBorrow,
    lent,
    settleLent,
    addLentMoney,
    payBill,
    submitFeedback,
    currency,
    setCurrency,
    theme,
    setTheme,
    formatCurrency,
    logout
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancials = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancials must be used within a FinancialProvider');
  }
  return context;
};
