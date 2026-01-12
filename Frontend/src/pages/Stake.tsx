import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { stake, unstake } from '@/services/api';
import { Leaf, WalletMinimal, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from 'react-router-dom';

export default function Stake() {
  const [amount, setAmount] = useState('');
  const [isStaking, setIsStaking] = useState(true); // true for stake, false for unstake
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const handleAction = async () => {
    if (!user) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive amount.',
        variant: 'destructive',
      });
      return;
    }

    if (isStaking && numAmount > user.balance) {
      toast({
        title: 'Insufficient balance',
        description: 'You don\'t have enough Leafcoin to stake.',
        variant: 'destructive',
      });
      return;
    }

    if (!isStaking && numAmount > user.staked_balance) {
        toast({
            title: 'Insufficient staked balance',
            description: 'You don\'t have enough Leafcoin staked to unstake this amount.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    try {
      if (isStaking) {
        await stake(numAmount);
        toast({
          title: 'Staking Successful',
          description: `${numAmount} Leafcoin has been staked.`,
        });
      } else {
        await unstake(numAmount);
        toast({
          title: 'Unstaking Successful',
          description: `${numAmount} Leafcoin has been unstaked.`,
        });
      }
      await refreshUser();
      setAmount('');
    } catch (error) {
      toast({
        title: `${isStaking ? 'Staking' : 'Unstaking'} Failed`,
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <WalletMinimal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Stake & Unstake Leafcoin
          </h1>
          <p className="text-muted-foreground mt-1">
            Become a validator or manage your staked balance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-6 mb-6"
        >
          <div className="mb-6">
            <label htmlFor="action-type" className="block text-sm font-medium text-muted-foreground mb-2">
              Choose Action
            </label>
            <Select value={isStaking ? 'stake' : 'unstake'} onValueChange={(value) => setIsStaking(value === 'stake')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stake">Stake Leafcoin</SelectItem>
                <SelectItem value="unstake">Unstake Leafcoin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Amount to {isStaking ? 'Stake' : 'Unstake'}</p>
            <div className="flex items-center justify-center gap-2">
              <Leaf className="w-8 h-8 text-primary" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-5xl font-display font-bold text-foreground bg-transparent border-none outline-none w-40 text-center"
                placeholder="0"
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isStaking ? `Available to stake: ${user?.balance.toLocaleString()} LC` : `Currently staked: ${user?.staked_balance.toLocaleString()} LC`}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              isStaking ? 'Stake Leafcoin' : 'Unstake Leafcoin'
            )}
          </Button>
        </motion.div>

        {user?.is_validator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              You are currently a validator. Check out the{' '}
              <Link to="/validate" className="text-primary hover:underline">
                Validation page
              </Link>
              .
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
