import {
  Send,
  Download,
  QrCode,
  History,
  Calendar,
  Gift,
  Zap,
  TrendingUp,
  Coins,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickActionButton } from '@/components/QuickActionButton';
import { TransactionItem } from '@/components/TransactionItem';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { mineCoin } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const quickActions = [
  { icon: Send, label: 'Send', to: '/send' },
  { icon: Download, label: 'Request', to: '/request' },
  { icon: QrCode, label: 'QR Code', to: '/qr' },
  { icon: Coins, label: 'Stake', to: '/stake' },
  { icon: Calendar, label: 'Events', to: '/events' },
  { icon: Gift, label: 'Rewards', to: '/rewards' },
  { icon: History, label: 'History', to: '/history' },
];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  
  // if (!user) return null; // user will be loaded by AuthProvider
  if (!user) return null; // user will be loaded by AuthProvider

  const recentTransactions = user.recentTransactions ? user.recentTransactions.slice(0, 5) : [];
  
  const handleValidate = async () => {
    // Implement validation logic here
    toast({
        title: "Validation Action",
        description: "Navigating to validation page...",
    });
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Balance Card */}
        <BalanceCard
          balance={user.balance}
          stakedBalance={user.staked_balance}
          isValidator={user.is_validator}
          change={350} // Placeholder, ideally this would come from user data
          userName={user.name.split(' ')[0]}
        />

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {quickActions.map((action, index) => {
                if (action.label === 'Validate' && !user.is_validator) {
                    return null;
                }
                return (
                    <QuickActionButton
                        key={action.label}
                        icon={action.icon}
                        label={action.label}
                        to={action.to}
                        onClick={action.label === 'Validate' ? handleValidate : undefined}
                        delay={0.1 * index}
                    />
                );
            })}
            {user.is_validator && (
                <QuickActionButton
                    key="Validate"
                    icon={TrendingUp} // Or another appropriate icon for validation
                    label="Validate"
                    to="/validate"
                    delay={0.1 * quickActions.length}
                />
            )}
          </div>
        </motion.section>

        {/* Stats Cards */}
        <motion.section
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-foreground">+1,250 LC</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Earned from activities</p>
          </div>

          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-xl font-bold text-foreground">12 Days</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </div>
        </motion.section>

        {/* Recent Transactions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Recent Transactions
            </h2>
            <Link to="/history">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  currentUserId={user.uid} // Changed from user.id to user.uid
                  index={index}
                />
              ))
            ) : (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by sending or receiving LeafCoins
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Promo Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-2xl p-6 md:p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-accent/30" />
            <div className="absolute inset-0 bg-card/40 backdrop-blur-xl" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Special Offer</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Refer a Friend, Earn 100 LC
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Invite your classmates and both of you get rewarded!
              </p>
              <Button size="sm">
                Invite Friends
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}