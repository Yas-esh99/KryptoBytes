import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Leaf, Lock, Check, Star, Zap, Trophy, Crown } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Reward } from '@/types';

const rewards: Reward[] = [
  {
    id: '1',
    title: 'Canteen Discount',
    description: '10% off on your next canteen purchase',
    requiredBalance: 500,
    icon: '🍕',
    claimed: false,
  },
  {
    id: '2',
    title: 'Library Extension',
    description: 'Extend book borrowing by 1 week',
    requiredBalance: 1000,
    icon: '📚',
    claimed: false,
  },
  {
    id: '3',
    title: 'Priority Registration',
    description: 'Early access to event registrations',
    requiredBalance: 2000,
    icon: '🎫',
    claimed: false,
  },
  {
    id: '4',
    title: 'Parking Pass',
    description: 'Premium parking spot for a month',
    requiredBalance: 3000,
    icon: '🚗',
    claimed: true,
  },
  {
    id: '5',
    title: 'Merch Bundle',
    description: 'Exclusive college merchandise pack',
    requiredBalance: 5000,
    icon: '👕',
    claimed: false,
  },
  {
    id: '6',
    title: 'Graduation Honor',
    description: 'Special recognition at graduation',
    requiredBalance: 10000,
    icon: '🎓',
    claimed: false,
  },
];

const tiers = [
  { name: 'Bronze', min: 0, max: 1000, icon: Star, color: 'text-amber-600' },
  { name: 'Silver', min: 1000, max: 5000, icon: Zap, color: 'text-slate-400' },
  { name: 'Gold', min: 5000, max: 10000, icon: Trophy, color: 'text-yellow-500' },
  { name: 'Platinum', min: 10000, max: Infinity, icon: Crown, color: 'text-purple-400' },
];

export default function Rewards() {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [claimedRewards, setClaimedRewards] = useState<string[]>(['4']);

  if (!user) return null;

  const currentTier = tiers.find(t => user.balance >= t.min && user.balance < t.max) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progressToNext = nextTier
    ? ((user.balance - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const handleClaim = (reward: Reward) => {
    if (user.balance < reward.requiredBalance) {
      toast({
        title: 'Insufficient balance',
        description: `You need ${reward.requiredBalance - user.balance} more LC`,
        variant: 'destructive',
      });
      return;
    }

    updateBalance(-reward.requiredBalance);
    setClaimedRewards([...claimedRewards, reward.id]);
    toast({
      title: 'Reward claimed!',
      description: `You've claimed: ${reward.title}`,
    });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-8 h-8 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Rewards
          </h1>
        </div>
        <p className="text-muted-foreground">
          Redeem your LeafCoins for exclusive perks
        </p>
      </motion.div>

      {/* Current Tier */}
      <motion.div
        className="glass-card p-6 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-card flex items-center justify-center ${currentTier.color}`}>
            <currentTier.icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Current Tier</p>
            <h2 className="font-display text-xl font-bold text-foreground">
              {currentTier.name} Member
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="font-bold text-lg text-primary">
              <Leaf className="inline w-4 h-4 mr-1" />
              {user.balance.toLocaleString()} LC
            </p>
          </div>
        </div>

        {nextTier && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress to {nextTier.name}</span>
              <span className="text-foreground font-medium">
                {(nextTier.min - user.balance).toLocaleString()} LC to go
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map((reward, index) => {
          const isClaimed = claimedRewards.includes(reward.id);
          const canClaim = user.balance >= reward.requiredBalance && !isClaimed;
          const isLocked = user.balance < reward.requiredBalance && !isClaimed;

          return (
            <motion.div
              key={reward.id}
              className={`glass-card p-5 relative overflow-hidden ${
                isClaimed ? 'opacity-60' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              {isClaimed && (
                <div className="absolute top-3 right-3">
                  <div className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Claimed
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="text-4xl">{reward.icon}</div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {reward.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium text-sm">
                      <Leaf className="inline w-4 h-4 mr-1" />
                      {reward.requiredBalance.toLocaleString()} LC
                    </span>
                    {!isClaimed && (
                      <Button
                        size="sm"
                        variant={canClaim ? 'default' : 'outline'}
                        disabled={isLocked}
                        onClick={() => handleClaim(reward)}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3 h-3" />
                            Locked
                          </>
                        ) : (
                          'Claim'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Layout>
  );
}