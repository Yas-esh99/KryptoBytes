import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '@/types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  getRecentTransactions: (userId: string, limit?: number) => Transaction[];
  getUserBalance: (userId: string) => number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Mock transactions
const initialTransactions: Transaction[] = [
  {
    id: '1',
    fromUserId: '2',
    fromUserName: 'Dr. Sarah Williams',
    toUserId: '1',
    toUserName: 'Alex Johnson',
    amount: 500,
    type: 'credit',
    category: 'NSS Activity',
    description: 'Participation in Blood Donation Camp',
    timestamp: new Date(Date.now() - 86400000),
    status: 'completed',
  },
  {
    id: '2',
    fromUserId: '1',
    fromUserName: 'Alex Johnson',
    toUserId: '3',
    toUserName: 'Mike Chen',
    amount: 100,
    type: 'send',
    description: 'Canteen payment',
    timestamp: new Date(Date.now() - 172800000),
    status: 'completed',
  },
  {
    id: '3',
    fromUserId: 'system',
    fromUserName: 'CampusCred',
    toUserId: '1',
    toUserName: 'Alex Johnson',
    amount: 200,
    type: 'reward',
    category: 'Achievement',
    description: 'Weekly top performer reward',
    timestamp: new Date(Date.now() - 259200000),
    status: 'completed',
  },
  {
    id: '4',
    fromUserId: '1',
    fromUserName: 'Alex Johnson',
    toUserId: 'events',
    toUserName: 'Tech Fest 2024',
    amount: 150,
    type: 'debit',
    category: 'Event',
    description: 'Tech Fest registration fee',
    timestamp: new Date(Date.now() - 345600000),
    status: 'completed',
  },
  {
    id: '5',
    fromUserId: '4',
    fromUserName: 'Emma Davis',
    toUserId: '1',
    toUserName: 'Alex Johnson',
    amount: 50,
    type: 'receive',
    description: 'Project collaboration',
    timestamp: new Date(Date.now() - 432000000),
    status: 'completed',
  },
];

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getRecentTransactions = (userId: string, limit = 10): Transaction[] => {
    return transactions
      .filter(t => t.fromUserId === userId || t.toUserId === userId)
      .slice(0, limit);
  };

  const getUserBalance = (userId: string): number => {
    return transactions.reduce((balance, t) => {
      if (t.toUserId === userId && t.status === 'completed') {
        return balance + t.amount;
      }
      if (t.fromUserId === userId && t.status === 'completed') {
        return balance - t.amount;
      }
      return balance;
    }, 0);
  };

  return (
    <TransactionContext.Provider 
      value={{ 
        transactions, 
        addTransaction, 
        getRecentTransactions,
        getUserBalance,
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