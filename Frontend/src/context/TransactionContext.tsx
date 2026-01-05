import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction } from '@/types';
import { getTransactions as apiGetTransactions, sendTransaction as apiSendTransaction } from '@/services/api';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  isFetching: boolean;
  isSending: boolean;
  fetchTransactions: (page?: number, limit?: number) => Promise<void>;
  sendLeafcoin: (recipientId: string, amount: number) => Promise<boolean>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { isAuthenticated, refreshUser } = useAuth();

  const fetchTransactions = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated) return;
    setIsFetching(true);
    try {
      const data = await apiGetTransactions(page, limit);
      // Backend returns timestamps as strings, convert them to Date objects
      const formattedTransactions = data.transactions.map(t => ({
        ...t,
        timestamp: new Date(t.timestamp)
      }));
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setIsFetching(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const sendLeafcoin = async (recipientId: string, amount: number): Promise<boolean> => {
    setIsSending(true);
    try {
      await apiSendTransaction(recipientId, amount);
      // Refresh transactions and user balance
      await fetchTransactions();
      await refreshUser();
      setIsSending(false);
      return true;
    } catch (error) {
      console.error("Failed to send Leafcoin:", error);
      setIsSending(false);
      // Potentially re-throw or handle the error to show a toast message in the UI
      throw error;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isFetching,
        isSending,
        fetchTransactions,
        sendLeafcoin,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}