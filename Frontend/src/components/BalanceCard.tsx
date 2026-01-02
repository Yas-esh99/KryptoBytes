import { motion } from 'framer-motion';
import { Leaf, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  change?: number;
  userName?: string;
}

export function BalanceCard({ balance, change = 0, userName }: BalanceCardProps) {
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl p-6 md:p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/5" />
      <div className="absolute inset-0 bg-card/40 backdrop-blur-xl" />
      
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      
      {/* Leaf Pattern */}
      <div className="absolute inset-0 leaf-pattern opacity-30" />
      
      <div className="relative z-10">
        {userName && (
          <p className="text-muted-foreground text-sm mb-1">
            Welcome back, <span className="text-foreground font-medium">{userName}</span>
          </p>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground text-sm">Available Balance</span>
        </div>
        
        <div className="flex items-baseline gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {formatBalance(balance)}
            </span>
          </div>
          <span className="text-xl text-muted-foreground font-medium">LC</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{formatBalance(Math.abs(change))}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">this week</span>
        </div>
      </div>
    </motion.div>
  );
}