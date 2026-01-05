import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Download } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionItem } from '@/components/TransactionItem';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/context/TransactionContext';

type FilterType = 'all' | 'sent' | 'received' | 'rewards';

export default function TransactionHistory() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  if (!user) return null;

  const userTransactions = transactions.filter(
    (t) => t.fromUserId === user.id || t.toUserId === user.id
  );

  const filteredTransactions = userTransactions.filter((t) => {
    // Search filter
    const matchesSearch =
      t.fromUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    if (filter === 'all') return matchesSearch;
    if (filter === 'sent') return matchesSearch && t.fromUserId === user.id && t.type === 'send';
    if (filter === 'received') return matchesSearch && t.toUserId === user.id && t.type !== 'send';
    if (filter === 'rewards') return matchesSearch && t.type === 'reward';

    return matchesSearch;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Sent', value: 'sent' },
    { label: 'Received', value: 'received' },
    { label: 'Rewards', value: 'rewards' },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Transaction History
        </h1>
        <p className="text-muted-foreground">
          View all your LeafCoin transactions
        </p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        className="space-y-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="whitespace-nowrap"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Received</span>
          </div>
          <p className="text-xl font-bold text-success">
            +{userTransactions
              .filter((t) => t.toUserId === user.id)
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString()} LC
          </p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Sent</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            -{userTransactions
              .filter((t) => t.fromUserId === user.id)
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString()} LC
          </p>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              currentUserId={user.id}
              index={index}
            />
          ))
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Your transactions will appear here'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Export Button */}
      {filteredTransactions.length > 0 && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Transactions
          </Button>
        </motion.div>
      )}
    </Layout>
  );
}