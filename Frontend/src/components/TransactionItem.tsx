import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Gift, Leaf, CreditCard } from 'lucide-react';
import { Transaction } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface TransactionItemProps {
  transaction: Transaction;
  currentUserId: string;
  index?: number;
}

export function TransactionItem({ transaction, currentUserId, index = 0 }: TransactionItemProps) {
  const isReceiving = transaction.toUserId === currentUserId;
  const isCredit = transaction.type === 'credit' || transaction.type === 'reward';
  const isPositive = isReceiving || isCredit;

  const getIcon = () => {
    switch (transaction.type) {
      case 'credit':
        return Leaf;
      case 'reward':
        return Gift;
      case 'debit':
        return CreditCard;
      default:
        return isReceiving ? ArrowDownLeft : ArrowUpRight;
    }
  };

  const getIconBg = () => {
    if (isPositive) return 'bg-success/20 text-success';
    return 'bg-destructive/20 text-destructive';
  };

  const Icon = getIcon();
  const displayName = isReceiving ? transaction.fromUserName : transaction.toUserName;

  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:bg-card/60"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg()}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {displayName}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {transaction.description || transaction.category || 'Transaction'}
        </p>
      </div>

      <div className="text-right">
        <p className={`font-semibold ${isPositive ? 'text-success' : 'text-foreground'}`}>
          {isPositive ? '+' : '-'}{transaction.amount} LC
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
}